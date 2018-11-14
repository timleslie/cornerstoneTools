import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';

/**
 * Move a new handle
 * @public
 * @method moveNewHandle
 * @memberof Manipulators
 *
 * @param {*} mouseEventData
 * @param {*} toolType
 * @param {*} data
 * @param {*} handle
 * @param {*} doneMovingCallback
 * @param {*} preventHandleOutsideImage
 * @returns {undefined}
 */
export default function(
  mouseEventData,
  toolType,
  data,
  handle,
  doneMovingCallback,
  preventHandleOutsideImage
) {
  console.log('moveNewHandle');
  const element = mouseEventData.element;

  function moveCallback(e) {
    const eventData = e.detail;

    handle.active = true;
    handle.x = eventData.currentPoints.image.x;
    handle.y = eventData.currentPoints.image.y;

    if (preventHandleOutsideImage) {
      clipToBox(handle, eventData.image);
    }

    external.cornerstone.updateImage(element);

    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data,
    };

    triggerEvent(element, eventType, modifiedEventData);
  }

  function whichMovement(e) {
    element.removeEventListener(EVENTS.MOUSE_MOVE, whichMovement);
    element.removeEventListener(EVENTS.MOUSE_DRAG, whichMovement);

    element.addEventListener(EVENTS.MOUSE_MOVE, moveCallback);
    element.addEventListener(EVENTS.MOUSE_DRAG, moveCallback);

    element.addEventListener(EVENTS.MOUSE_CLICK, moveEndCallback);
    if (e.type === EVENTS.MOUSE_DRAG) {
      element.addEventListener(EVENTS.MOUSE_UP, moveEndCallback);
    }
  }

  function measurementRemovedCallback(e) {
    const eventData = e.detail;

    if (eventData.measurementData === data) {
      moveEndCallback();
    }
  }

  function toolDeactivatedCallback(e) {
    const eventData = e.detail;

    if (eventData.toolType === toolType) {
      element.removeEventListener(EVENTS.MOUSE_MOVE, moveCallback);
      element.removeEventListener(EVENTS.MOUSE_DRAG, moveCallback);
      element.removeEventListener(EVENTS.MOUSE_CLICK, moveEndCallback);
      element.removeEventListener(EVENTS.MOUSE_UP, moveEndCallback);
      element.removeEventListener(
        EVENTS.MEASUREMENT_REMOVED,
        measurementRemovedCallback
      );
      element.removeEventListener(
        EVENTS.TOOL_DEACTIVATED,
        toolDeactivatedCallback
      );

      handle.active = false;
      external.cornerstone.updateImage(element);
    }
  }

  element.addEventListener(EVENTS.MOUSE_DRAG, whichMovement);
  element.addEventListener(EVENTS.MOUSE_MOVE, whichMovement);
  element.addEventListener(
    EVENTS.MEASUREMENT_REMOVED,
    measurementRemovedCallback
  );
  element.addEventListener(EVENTS.TOOL_DEACTIVATED, toolDeactivatedCallback);

  function moveEndCallback() {
    console.log('moveNewHandle: mouseMoveEndCallback');
    element.removeEventListener(EVENTS.MOUSE_MOVE, moveCallback);
    element.removeEventListener(EVENTS.MOUSE_DRAG, moveCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, moveEndCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, moveEndCallback);
    element.removeEventListener(
      EVENTS.MEASUREMENT_REMOVED,
      measurementRemovedCallback
    );
    element.removeEventListener(
      EVENTS.TOOL_DEACTIVATED,
      toolDeactivatedCallback
    );

    handle.active = false;
    external.cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }
}
