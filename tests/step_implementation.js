/* globals gauge*/
"use strict";
const path = require('path');
const {
    openBrowser,
    write,
    closeBrowser,
    goto,
    press,
    screenshot,
    click,
    into,
    textBox,
    evaluate,
    $,
    dropDown,
} = require('taiko');
const assert = require("assert");
const headless = process.env.headless_chrome.toLowerCase() === 'true';

beforeSuite(async () => {
    await openBrowser({
        headless: headless
    })
});

afterSuite(async () => {
    await closeBrowser();
});

// Return a screenshot file name
gauge.customScreenshotWriter = async function () {
    const screenshotFilePath = path.join(process.env['gauge_screenshots_dir'],
        `screenshot-${process.hrtime.bigint()}.png`);

    await screenshot({
        path: screenshotFilePath
    });
    return path.basename(screenshotFilePath);
};

step("Open google", async () => {
    await goto("google.com");
});

step("Write <item> then search", async (item) => {
    await write(item, into(textBox()));
    await press("Enter");
});

step("Open first web page with no ads", async () => {
    await click($(".LC20lb"));
});

step("Change listing to <item>", async (item) => {
    await dropDown({id: "sortingTypeSelect"}).exists();
    await dropDown({id: "sortingTypeSelect"}).select(item);
});

step("Pick first product", async () => {
    await click($("#productsList > li:nth-child(1)"));
});

let productData = {};

step("Select <item> size then add to cart", async (item) => {
    productData = {
        productBrand: await $("[itemprop=brand]").text(),
        productName: await $("[itemprop=name]").text() 
    };

    await dropDown({class: "productSizeSelect"}).select({index: item});
    await click("Sepete Ekle");
});

step("Check the cart", async () => {
    await click("Sepetim");

    let cartData = await evaluate(() => {
        return {
            cartBrand: document.querySelector(".basketList-itemBrand").textContent.trim(),
            cartName: document.querySelector(".basketList-itemName").textContent.trim()
        }
    });

    assert.equal(productData.productBrand, cartData.cartBrand);
    assert.equal(productData.productName, cartData.cartName);
});