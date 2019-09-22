const validate = require('./index')
const { expect } = require('chai')

describe("validate", () => {
    describe("string", () => {
        it("should detect that it's a string and not throw error", () => {
            const response = validate.string('hello', 'string')
            expect(response).to.be.undefined
        })
        it("should detect empty string", () => {
            expect(() => { validate.string() }).to.throw(Error, "undefined with value undefined is not a string")
        })
    })
    describe("email", () => {
        it("should detect that it's a email and not throw error", () => {
            const response = validate.email("a.a@test.com", "email")
            expect(response).to.be.undefined
        })
        it("should throw error if the email is not a email", () => {
            expect(() => { validate.email("a.a@com", "email") }).to.throw(Error, "email with value a.a@com is not a valid e-mail")
        })
    })
    describe("function", () => {
        it("should detect that it's a function and not throw error", () => {
            const func = function funct() { }
            const response = validate.function(func, "function")
            expect(response).to.be.undefined
        })
        it("should trow error if its not a function", () => {
            expect(() => { validate.function("hola", "function") }).to.throw("function with value hola is not a function")
        })
    })
    describe("url", () => {
        it("should detect that it's a url and not throw error", () => {
            const response = validate.url("www.url.com", "url")
            expect(response).to.be.undefined
        })
        it("should throw error if its not a url ", () => {
            expect(() => { validate.url("hola", "url") }).to.throw("url with value hola is not a valid URL")
        })
    })
})