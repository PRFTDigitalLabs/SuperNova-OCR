var cv = require('opencv');
var util = require('util');
var exec = require('child_process').exec;
var proc;

console.log("\r\nSSOCR should say: '1234567890'");

proc = exec("ssocr ./server/img/1234567890.png -d -1", function(error, stdout, stderr) {
  if (error || stderr) {
    console.error(stderr);
  } else {
    console.log(stdout.trim());
  }
});

cv.readImage(__dirname + "/img/mona.png", function(err, im) {
  if (err) {
    console.error(err);
  } else {
    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
      if (err) {
        console.error(err);
      } else {
        for (var i = 0; i < faces.length; i++) {
          var x = faces[i]
            //im.ellipse(x.x + x.width / 2, x.y + x.height / 2, x.width / 2, x.height / 2);
        }
        if (x) {
          console.log("OpenCV found a face: ", x);
        } else {
          console.log("OpenCV did not find a face.");
        }
      }
    });
  }
})
