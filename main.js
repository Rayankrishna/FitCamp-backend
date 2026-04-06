

const readline = require("readline");
function add(a, b) {
    return a + b;
}




const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let c, d;
let sum;
rl.question("Enter first number: ", (input1) => {
    c = Number(input1);

    rl.question("Enter second number: ", (input2) => {
        d = Number(input2);

        sum = add(c, d);
        console.log(sum);

        rl.close();
    });



});
if (sum > 700) {
    console.log("greater than 4");
} else {
    console.log("less than 4");

}

