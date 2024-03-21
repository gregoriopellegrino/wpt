// META: script=/resources/testdriver.js
// META: script=/common/utils.js
// META: script=resources/fledge-util.sub.js
// META: script=/common/subset-tests.js
// META: timeout=long
// META: variant=?1-5
// META: variant=?6-last


"use strict;"

// This test repeatedly runs auctions to verify an update. A modified bidding script
// continuously throws errors until it detects the expected change in the interest group
// field. This update then stops the auction cycle.
const makeTestForUpdate = ({
  // Test name
  name,
  // fieldname that is getting updated
  interestGroupFieldName,
  // this is used to create the update and check if it happened.
  expectedValue,
  // Overrides to the interest group.
  interestGroupOverrides = {},
  // Overrides to the auction config.
  auctionConfigOverrides = {},
}) => {
  subsetTest(promise_test, async test => {
    const uuid = generateUuid(test);
    extraBiddingLogic = ""

    // Testing 'ads' and 'adComponents' requires some additional setup due to their reliance
    // on createRenderURL. This test starts with a basic render URL. To differentiate the update,
    // the expected value will be the same as the one within the interest group but with a unique
    // query parameter added. When checking the render URL, both the old and new versions
    // might exist in the interest group, so this test deletes the old one to ensure a clean comparison
    // with deepEquals.
    if (interestGroupFieldName == "ads" || interestGroupFieldName == "adComponents") {
      if (expectedValue == "renderURL") {
        expectedValue = [{ "renderURL": createRenderURL(uuid, null, "newURL", null) }]
        interestGroupOverrides[`${interestGroupFieldName}`].renderURL = [{ "renderURL": createRenderURL(uuid) }]
        extraBiddingLogic = `
          delete interestGroup.${interestGroupFieldName}[0].renderUrl;`
      }
    }

    expectedValue = JSON.stringify(expectedValue)
    // When the update has not yet been seen, throw an error which will cause the auction not to have a result.
    interestGroupOverrides.biddingLogicURL = createBiddingScriptURL({
      generateBid: `
      ${extraBiddingLogic}
      if(JSON.stringify(interestGroup.${interestGroupFieldName}) != '${expectedValue}'){
        throw "${interestGroupFieldName} is " + JSON.stringify(interestGroup.${interestGroupFieldName})+ " instead of "+'${expectedValue}'
      }
      `
    });

    let responseBody = {};
    responseBody[interestGroupFieldName] = expectedValue;
    params = {
      body: JSON.stringify(responseBody),
      uuid: uuid
    }
    interestGroupOverrides.updateURL = createUpdateURL(params);
    await joinInterestGroup(test, uuid, interestGroupOverrides);

    // Throw until an auction happens, which means update occurred.
    let auctionResult = null
    while (!auctionResult) {
      auctionResult = await runBasicFledgeAuction(test, uuid, auctionConfigOverrides);
      if (auctionResult)
        break;
    }

  }, name);
};

// In order to test the update process does not update certain fields, this test uses two interest groups:

// * `IG1`: Receives the update and will signal the change by throwing an error.
// * `IG2`: Remains un-updated and will continue to throw errors until the change reaches it (which shouldn't happen).

// By tracking render URLs, this test guarantees that only the URL associated with the correct update
// (`goodUpdateURL`) is used, and the incorrect URL (`badUpdateURL`) isn't. The test runs
// auctions repeatedly until the update in `IG1` stops an auction from producing a winner.
// It then will run one final auction. If there's still no winner, it can infer that `IG2` would have
// received the update if it were propagating correctly.
const makeTestForNoUpdate = ({
  // Test name
  name,
  // fieldname that is getting updated
  fieldNameWithUpdate,
  // fieldname that is should not be getting updated
  fieldNameWithoutUpdate,
  // this is used to create the update response and check if it happened.
  fieldNameWithUpdateExpectedValue,
  // this is used to create the update response and check if it did not happen.
  fieldNameWithoutUpdateTestValue,
  // Overrides to the auction config.
  auctionConfigOverrides = {},
}) => {
  subsetTest(promise_test, async test => {
    const uuid = generateUuid(test);

    // IG1
    let IG1 = {}
    const goodUpdateURL = createTrackerURL(window.location.origin, uuid, "track_get", "good_update");
    IG1.name = "name 1"
    IG1.ads = [{ "renderURL": goodUpdateURL }]
    IG1.biddingLogicURL = createBiddingScriptURL({
      generateBid: `
      if(JSON.stringify(interestGroup.${fieldNameWithUpdate}) == '${JSON.stringify(fieldNameWithUpdateExpectedValue)}'){
        throw "${fieldNameWithUpdate} has updated and is " +
        '${JSON.stringify(fieldNameWithUpdateExpectedValue)}.'
      }
      `
    });
    let responseBody1 = {};
    responseBody1[fieldNameWithUpdate] = JSON.stringify(fieldNameWithUpdateExpectedValue);
    let params1 = {
      body: JSON.stringify(responseBody1),
      uuid: uuid
    }
    IG1.updateURL = createUpdateURL(params1);
    await joinInterestGroup(test, uuid, IG1);
    ///////////////////////// IG1

    // IG2
    const badUpdateURL = createTrackerURL(window.location.origin, uuid, "track_get", "bad_update");
    let IG2 = {}
    IG2.name = "name 2"
    IG2.ads = [{ "renderURL": badUpdateURL }]
    IG2.biddingLogicURL = createBiddingScriptURL({
      generateBid: `
      if(JSON.stringify(interestGroup.${fieldNameWithoutUpdate}) != '${JSON.stringify(fieldNameWithoutUpdateTestValue)}'){
        throw "${fieldNameWithoutUpdate} is as expected: "+ JSON.stringify(interestGroup.${fieldNameWithoutUpdate})
      }
      `
    });
    let responseBody2 = {};
    responseBody2[fieldNameWithoutUpdate] = JSON.stringify(fieldNameWithoutUpdateTestValue);

    let params2 = {
      body: JSON.stringify(responseBody2),
      uuid: uuid
    }

    IG2.updateURL = createUpdateURL(params2);
    await joinInterestGroup(test, uuid, IG2);
    ///////////////////////// IG2

    // First result should be not be null, `IG1` throws when update is detected so until then,
    // run and observe the requests to ensure only `goodUpdateURL` is fetched.
    let auctionResult = await runBasicFledgeAuction(test, uuid, auctionConfigOverrides);
    while (auctionResult) {
      createAndNavigateFencedFrame(test, auctionResult);
      await waitForObservedRequests(
        uuid,
        [goodUpdateURL, createSellerReportURL(uuid)]);
      auctionResult = await runBasicFledgeAuction(test, uuid, auctionConfigOverrides);
    }
    // Re-run to ensure null because:
    // `IG1` should be throwing since update occurred.
    // `IG2` should be throwing since update did not occur.
    auctionResult = await runBasicFledgeAuction(test, uuid, auctionConfigOverrides);
    assert_true(auctionResult == null);

  }, name);
};

makeTestForUpdate({
  name: "userBiddingSignals updated correctly",
  interestGroupFieldName: "userBiddingSignals",
  expectedValue: { "test": 20 },
  interestGroupOverrides: {
    userBiddingSignals: { "test": 10 },
  }
})

makeTestForUpdate({
  name: "trustedBiddingSignalsKeys updated correctly",
  interestGroupFieldName: "trustedBiddingSignalsKeys",
  expectedValue: ["new_key"],
  interestGroupOverrides: {
    trustedBiddingSignalsKeys: ["old_key"],
  }
})

makeTestForUpdate({
  name: "trustedBiddingSignalsSlotSizeMode updated correctly",
  interestGroupFieldName: "trustedBiddingSignalsSlotSizeMode",
  expectedValue: "slot-size",
  interestGroupOverrides: {
    trustedBiddingSignalsKeys: ["key"],
    trustedBiddingSignalsSlotSizeMode: "none",
  }
})

makeTestForUpdate({
  name: "executionMode updated correctly",
  interestGroupFieldName: "executionMode",
  expectedValue: "frozen-context",
  interestGroupOverrides: {
    executionMode: "compatibility",
  }
})

makeTestForUpdate({
  name: "ads updated correctly",
  interestGroupFieldName: "ads",
  expectedValue: "renderURL",
  interestGroupOverrides: {
    ads: [{ "renderURL": window.location.origin }]
  }
})

makeTestForUpdate({
  name: "adComponents updated correctly",
  interestGroupFieldName: "adComponents",
  expectedValue: "renderURL",
  interestGroupOverrides: {
    adComponents: [{ "renderURL": window.location.origin }]
  }
})

makeTestForNoUpdate({
  name: "owner cannot be updated correctly",
  fieldNameWithUpdate: "userBiddingSignals",
  fieldNameWithoutUpdate: "owner",
  fieldNameWithoutUpdateTestValue: "https://www.new-example-dsp.com",
  fieldNameWithUpdateExpectedValue: { "test": 20 },
})

makeTestForNoUpdate({
  name: "name cannot be updated correctly",
  fieldNameWithUpdate: "executionMode",
  fieldNameWithoutUpdate: "name",
  fieldNameWithoutUpdateTestValue: "new name",
  fieldNameWithUpdateExpectedValue: "frozen-context",
})