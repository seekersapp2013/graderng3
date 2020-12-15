import Log from "./nomie-log";
import math from "../../utils/math/math";

describe("modules/nomie-log", function () {
  let log;
  let stub = {
    note: `I'm a note for #testing and I'm #good(344) and #good and kinda #bad sometimes #bad and @brandon is now here +testing context and +more.
		 I bet @betty would have dug Nomie, she was my grandmother. #cheese(50) +love
		`,
  };

  it("should handle the speed", () => {
    let start = new Date().getTime();
    let items = [];
    for (var i = 0; i < 100000; i++) {
      let log = new Log({
        lat: 39.764,
        lng: 126.978,
        note: "Testing Location Soule",
      });
      items.push(log);
    }
    let end = new Date().getTime() - start;
  });

  it("log.getMeta", () => {
    log = new Log(stub);
    const meta = log.getMeta();

    expect(meta.People[0].id).toEqual("brandon");
    expect(meta.People[1].id).toEqual("betty");
    expect(meta.context[0].id).toEqual("testing");
    expect(meta.context[1].id).toEqual("more");
    expect(meta.context[2].id).toEqual("love");
    expect(meta.trackers[0].id).toEqual("testing");
  });

  it("log initializes", () => {
    log = new Log(stub);
    expect(log).toBeInstanceOf(Log);
    // expect(log.note).toEqual(stub.note);
  });

  it("should scrub the note", () => {
    log = new Log({
      note: "Hello #there @brandon",
    });
    let scrubbed = log.getScrubbedNote();
    expect(scrubbed).toEqual("Hello @brandon");
  });

  it("should scrub the note", () => {
    log = new Log({
      note: "Hello #there #there(40) #there(30) @brandon",
    });
    let value = log.getTrackerValue("there");
    expect(value).toEqual(71);
  });

  it("log.toObject", () => {
    log = new Log(stub);
    expect(typeof log.toObject()._id).toEqual("string");
  });
  it("log.expanded", () => {
    log = new Log(stub);
    log.getMeta();
    expect(log.trackers.length).toEqual(6);
  });
  it("log.hasTracker", () => {
    log = new Log(stub);
    log.getMeta();
    expect(log.hasTracker("testing")).toEqual(true);
    expect(log.hasTracker("nothing")).toEqual(false);
  });

  it("log.addTag", () => {
    log = new Log(stub);
    log.expanded();
    log.addTag("cheese", 50);
    expect(log.hasTracker("cheese")).toEqual(true);
    expect(math.sum(log.getTrackerValues("cheese"))).toEqual(100);
  });
});
