#!/usr/bin/env node

const puppeteer = require('puppeteer');

const ENTRY_URL     = 'https://mit.orsted.dk/login/email/';

const USER_ID       = 'jens@bennerhq.com';
const USER_PW       = 'fido99kalle';

/***
 * https://api.obviux.dk/v2/authenticate
 * https://api.obviux.dk/v2/profile
 * https://api.obviux.dk/v2/deliveries
 * https://api.obviux.dk/v2/forward-prices/2930
 * https://api.obviux.dk/v2/invoices?page=1
 * https://api.obviux.dk/v2/payment
 * https://api.obviux.dk/v2/agreements
 * https://api.obviux.dk/v2/products
 * https://capi.obviux.dk/v1/consumption/customer/2bdfede1-8fda-446e-a541-2416b319d138/ean/571313174110046541/weekly
 * https://capi.obviux.dk/v1/consumption/customer/2bdfede1-8fda-446e-a541-2416b319d138/ean/571313174110046541/daily
 * https://capi.obviux.dk/v1/consumption/customer/2bdfede1-8fda-446e-a541-2416b319d138/ean/571313174110046541/hourly
 * https://capi.obviux.dk/v1/consumption/customer/2bdfede1-8fda-446e-a541-2416b319d138/ean/571313174110046541/yearly/?from=2014-08-26&to=2019-08-26
 * https://capi.obviux.dk/v1/consumption/customer/2bdfede1-8fda-446e-a541-2416b319d138/ean/571313174110046541/monthly/?from=2014-08-26&to=2019-08-26
 */
const FILTER_URL    = 'https://capi.obviux.dk/v1/consumption/customer/';

(async () => {
    var filtered = [];

    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(ENTRY_URL);

    await page.focus("[type='email']");
    await page.keyboard.type(USER_ID);

    await page.focus("[type='password']");
    await page.keyboard.type(USER_PW);

    await page.focus("[type='submit']");
    await page.keyboard.press('Enter');

    var store = (response, url) => {
        response.text().then(function (string) {
            var json = JSON.parse(string);
            var item = {
                url: url,
                data: json
            };
            filtered.push(item);
        }).catch((error) => {
            // ...
        });
    };

    page.on('response', async response => {
        const request = response.request();
        const type = request.resourceType();
        const url = request.url();
        if ((type === "xhr") && (url.indexOf(FILTER_URL) === 0)) {
            store(response, url);
        }
    });

    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });

    await browser.close();

    console.log(JSON.stringify(filtered, null, 2));
})();
