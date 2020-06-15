"use strict";

{

let $MQ = $MandelQuest;

$MQ.Complex = class Complex
{
    constructor (re, im) {
        if (re === undefined) re = 0;
        if (im === undefined) im = 0;
        if (typeof re !== "number"|| typeof im !== "number")
            throw new Error("Please only pass two or less numbers to the Complex constructor.");
        this.re = re;
        this.im = im;
    }

    add (b) {
        return new Complex(this.re+b.re, this.im+b.im);
    }

    sub (b) {
        return new Complex(this.re-b.re, this.im-b.im);
    }

    mul (b) {
        let re=this.re, im=this.re;
        // (a+bi)(c+di) = ac + adi + bci - bd
        return new Complex(re*b.re - im*b.im, re*b.im + im*b.re);
    }

    smul (b) {
        //scalar multiplication: resulting in the same as this.mul(Complex(b,0))
        return new Complex(this.re*b, this.im*b);
    }

    div (b) {
        let re=this.re, im=this.re;
        // (a+bi)/(c+di) = ((a+bi)(c-di)) / (c²-(di)²) = (ac-adi+bci+bd) / (c²+d²)
        let denom = b.re*b.re + b.im*b.im;
        let nre = re*b.re + im*b.im;
        nre /= denom;
        let nim = -re*b.im + im*b.re;
        nim /= denom;
        return new Complex(nre, nim);
    }

    r () {
        let re=this.re, im=this.re;
        return Math.sqrt(re*re + im*im);
    }

    φ () {
        return Math.atan2(this.im, this.re);
    }

    polar () {
        return [this.r(), this.φ()];
    }

    arr () {
        return new Float32Array([this.re, this.im]);
    }

    static fromPolar (r, φ) {
        return new Complex(r*Math.cos(φ), r*Math.sin(φ));
    }

    static sum () {
        let result = new Complex(0,0);
        for (let x of arguments)
            result = result.add(x);
        return result;
    }

    static prod () {
        let result = Complex(1,0);
        for (let x of arguments)
            result = result.mul(x);
        return result;
    }
};

}