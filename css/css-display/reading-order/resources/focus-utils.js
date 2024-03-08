'use strict';

function navigateFocusForward() {
  // TAB = '\ue004'
  return test_driver.send_keys(document.body, "\ue004");
}

async function navigateFocusBackward() {
  return new test_driver.Actions()
    .keyDown('\uE050')
    .keyDown('\uE004')
    .keyUp('\uE004')
    .keyUp('\uE050')
    .send();
}