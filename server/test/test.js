import { expect } from "chai";
import supertest from "supertest";
import app from "../app.js";



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

describe('Testing Prerequisites API', ()=>{

    it('Testing Prerequisites API',async function(){
       
        var response= await supertest(app).get(`/server/prerequisites`).send({         
        })

        expect(response.status).equal(200)
    })
})   