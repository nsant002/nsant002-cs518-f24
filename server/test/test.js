import { expect } from "chai";
import supertest from "supertest";
import app from "../app.js";

describe('Addition Testing', ()=>{

    it('Should Add two numbers',function(){
        var num1=2;
        var num2=5;
        expect(num1+num2).equal(7)
    })

    it('Should Add 3 numbers',function(){
        var num1=2;
        var num2=5;
        var num3=1;
        expect(num1+num2+num3).equal(8)
    })

})


describe('Testing Successful Login', ()=>{

    it('Testing Positive Case of Login API',async function(){
       
        var response= await supertest(app).post(`/server/login/test`).send({
             email: "yourninjanextdoor@msn.com",
             password: "LolN!n!2910"
        })

        expect(response.status).equal(200)
    })
})

describe('Testing Login Failure', ()=>{

    it('Testing Negative Case of Login API',async function(){
       
        var response= await supertest(app).post(`/server/login/test`).send({
             email: "yourninjanextdoor@msn.com",
             password: "123456"
        })

        expect(response.status).equal(401)
    })
})   