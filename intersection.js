
module.exports = function(p1,p2,p3,p4) {
    // Determine line equations
    // |A1 B1| |x|   |C1|
    // |A2 B2| |y| = |C2|
    var A1, B1, C1, A2, B2, C2;
    A1 = p1.y - p2.y;
    B1 = p2.x - p1.x;
    C1 = A1*p1.x + B1*p1.y;
    A2 = p3.y - p4.y;
    B2 = p4.x - p3.x;
    C2 = A2*p3.x + B2*p3.y;
    // Solve for intersection
    // Parallel lines:
    // if (A1*B2 == B1*A2) {
        // return null;
    // }

    // Inverse of matrix:
    // | B2 -B1|
    // |-A2  A1|/D
    var D = A1*B2 - B1*A2;
    var x = (B2*C1 - B1*C2)/D;
    var y = (A1*C2 - A2*C1)/D;
    return {x:x,y:y};
}