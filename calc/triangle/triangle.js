const inputs = [
  document.getElementById('a'),
  document.getElementById('b'),
  document.getElementById('c'),
  document.getElementById('A'),
  document.getElementById('B'),
  document.getElementById('C'),
];

function degToRad(d) {
    return d * Math.PI / 180
};

function radToDeg(r) {
    return r * 180 / Math.PI
};

// Math Stuff
// 3 Sides
// 2 Sides 1 Angle
//  a b C
//  b c A
//  a c B
// 2 Angle 1 Side
