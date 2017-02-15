/**
 * Created by John on 2017-02-08.
 */

import DataController from "../src/controller/DataController";
import {isUndefined} from "util";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
const fs = require("fs");
let content: string = "";
import {expect} from 'chai';
import {GeoResponse} from "../src/controller/IInsightFacade";

describe("Room Controller Test", function () {

    this.timeout(500000);
    var controller = new InsightFacade();
    const room = new DataController();
    before(function (done) {

        Log.test('Before: ' + (<any>this).test.parent.title);
        fs.readFile('./zips/rooms.zip', function (err: any, data: any) {
            if (err) {
                //invalid zip file is given
                console.log(err);
            }
            else if (!isUndefined(data) || data !== null) {
                //debug, if given content is invalid
                //since given data is a array buffer, we can convert right away
                content = data.toString('base64');
                console.log("Before: content is done!");
                done();
            }
        });
    });

    it("add rooms", function () {
        return controller.addDataset('rooms', content)
            .then(function(response) {
                expect(response.code).to.deep.equal(204);
                expect(response.body).to.deep.equal({});
            }).catch(function(err) {
                console.log(err);
                expect.fail();
            })
    });

    it("fetch geo", function (done) {
        room.room_fetchGeo('6245 Agronomy Road V6T 1Z4')
            .then(function(res: GeoResponse)
        {
            expect(res.lat).to.deep.equal(49.26125);
            expect(res.lon).to.deep.equal(-123.24807);
           done();
        }).catch( function(err: any){
            //console.log(err);
        })
    });

    it("fetch invalid geo", function (done) {
        room.room_fetchGeo(null).then(function(res: any)
        {
            expect(res.error).to.deep.equal('address is not defined!-125');
            done();
        }).catch( function(err: any){
            console.log(err);
            done();
        })
    });

});

