var settings = require('../package.json');
var path = require('path');

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;
var proc;

var cv = require('opencv');

var _ = require('underscore');
var numbers = require('numbers');

var Watcher = function() {
  var self = this;

  self.settings = settings.config.watcher;

  // (B)lue, (G)reen, (R)ed
  self.playerColors = [
    [255, 255, 255], //white (ball / match)
    [0, 0, 255], //red (player 1)
    [0, 255, 0], //green (player 2)
    [255, 0, 0], //blue (player 3)
    [0, 255, 255] //yellow (player 4)
  ];

  self.CVoptions = {
    camWidth: 1280,
    camHeight: 720,
    interval: 50,
    maskLowThresh: 0,
    maskHighThresh: 1,
    threshold: 175,
    blurRadius: 3,
    maskFile: 'firepower-4player-mask.png'
  };

  self.status = {
    isReady: false,
    scores: []
  };

  // initialize function
  self.init = function() {
    try {
      //self.camera = new cv.VideoCapture(self.settings.index);

      var testMOV = path.join(__dirname, 'img', 'firepower-4player.mp4');
      console.log(testMOV);
      self.camera = new cv.VideoCapture(testMOV);

      if (self.camera) {
        self.camera.setWidth(self.CVoptions.camWidth);
        self.camera.setHeight(self.CVoptions.camHeight);

        if (self.settings.debug) {
          self.window = new cv.NamedWindow('Video', cv.CV_WINDOW_AUTOSIZE);
        }

        cv.readImage(path.join(__dirname, 'img', self.CVoptions.maskFile), function(err, im) {
          if (err) {
            self.showError(err);
          } else {
            self.mask = im;
          }
        });

        if (self.findROI(self.CVoptions.maskFile) > 0) {
          console.log("📸  tracking " + self.status.scores.length + " score regions.");
          self.connect();
        } else {
          self.showError("no score regions found");
        }
      } else {
        self.showError("no camera");
      }
    } catch (e) {
      self.showError(e);
    }
  }

  self.findROI = function() {
    var out = new cv.Matrix(self.CVoptions.camHeight, self.CVoptions.camWidth);

    im_canny = self.mask.copy();
    im_canny.canny(self.CVoptions.maskLowThresh, self.CVoptions.maskHighThresh);
    var contours = im_canny.findContours();

    for (i = 0; i < contours.size(); i++) {
      var rect = contours.boundingRect(i);
      var JSONrect = JSON.stringify(rect);
      var regionExists = false;

      _.each(self.status.scores, function(score) {
        if (JSON.stringify(score.rect) === JSONrect) {
          regionExists = true;
        }
      });

      if (!regionExists) {
        score = {
          rect: rect,
          isWide: false,
          smooth: [0, 0, 0, 0, 0],
          strValue: '00',
          intValue: 0,
          playerIndex: 0
        };

        self.status.scores.push(score);
      }
    }

    self.getIndexes();

    return self.status.scores.length;
  }

  self.getIndexes = function() {

    var index = 0;

    _.each(self.status.scores, function(score) {
      var ROI = self.mask.roi(score.rect.x, score.rect.y, score.rect.width, score.rect.height);

      //center pixel of masked score region for color
      var val = ROI.pixel(Math.round(score.rect.height / 2), Math.round(score.rect.width / 2));

/*
      var file = path.join(__dirname, 'img/watch', 'area' + index + '.png');
      ROI.save(file);
*/
      _.each(self.playerColors, function(color) {
        if (JSON.stringify(val) == JSON.stringify(color)) {
          score.playerIndex = self.playerColors.indexOf(color);
          score.color = color;

          if (score.playerIndex > 0) {
            score.isWide = true;
            score.strValue = '000000';
          }
        }
      });

      index += 1;
    });
  }

  self.connect = function() {
    self.changeStatus(true);

    setInterval(function() {
      self.camera.read(function(err, im) {
        if (err) {
          self.showError(err);
        } else {
          if (im.size()[0] > 0 && im.size()[1] > 0) {

            var index = 0;
            _.each(self.status.scores, function(score) {
              im.rectangle([score.rect.x, score.rect.y], [score.rect.width, score.rect.height], score.color, 2);

              var ROI = im.roi(score.rect.x, score.rect.y, score.rect.width, score.rect.height);
              ROI.convertGrayscale();

              var invertROI = ROI.threshold(self.CVoptions.threshold, 255, "Binary Inverted");
              //invertROI.gaussianBlur([self.CVoptions.blurRadius, self.CVoptions.blurRadius]);

              score.file = path.join(__dirname, 'img/watch', 'output' + score.playerIndex + '.png');
              invertROI.save(score.file);

              self.parseImage(score);

              index++;
            });

            if (self.window) {
              self.window.show(im);
            }
          }
          if (self.window) {
            self.window.blockingWaitKey(0, self.CVoptions.interval);
          }
        }
      });
    }, self.CVoptions.interval);
  }

  self.parseImage = function(score) {
    //openCV seems to be adding a strange border around the image. luckilly SSOCR has a crop param:
    var cmd = "ssocr -d -1 crop 2 2 " + (score.rect.width - 3) + " " + (score.rect.height - 3) + " " + score.file;
    proc = exec(cmd, function(error, stdout, stderr) {
      if (stderr) {
        self.showError(stderr);
      } else {
        if ((stdout.indexOf('_') == -1) && (stdout.indexOf('-') == -1)) {
          score.strValue = stdout;

          var val = parseInt(stdout);
          score.smooth.shift();
          score.smooth.push(val);

          var mode = numbers.statistic.mode(score.smooth);

          if (mode != score.intValue) {
            score.intValue = mode;
            self.updateScores(score.playerIndex);
          }
        }
      }
    });
  }

  self.updateScores = function(currentPlayer) {

    var smScores = [];

    _.each(self.status.scores, function(score) {
      var sc;
      if (score.isWide) {
        sc = {
          name: 'player ' + score.playerIndex,
          value: score.intValue
        };
      } else {
        sc = {
          name: 'ball',
          value: score.intValue
        };
      }

      if (score.playerIndex == currentPlayer) {
        sc.isActive = true;
      } else {
        sc.isActive = false;
      }

      smScores.push(sc);
    });

    self.emit('scored', smScores);
  }

  self.changeStatus = function(isReady) {
    if (isReady != undefined) {
      self.status.isReady = isReady;
    }
    self.emit('ready', self.status.isReady);
    if (self.status.isReady == true) {
      console.log('📸  👍');
    } else {
      console.log('📸  👎');
    }
  }

  self.showError = function(error) {
    console.error('📸  😢  : ' + error);
    self.changeStatus(false);
  }

}

util.inherits(Watcher, EventEmitter);
module.exports = Watcher;
