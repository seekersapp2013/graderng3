import arrayUtils from "./array_utils";

describe("array utils test", () => {
  let test = [1, 1, 2, 3, 4, 5, 5];
  it("should remove duplicates", () => {
    expect(JSON.stringify(arrayUtils.unique(test))).toBe(JSON.stringify([1, 2, 3, 4, 5]));
  });
  it("should split an array", () => {
    let split = arrayUtils.split(test);
    expect(split[0].length).toBe(4);
  });
  it("should chunk an array", () => {
    let split = arrayUtils.chunk(["brandon", "bob", "jake", "emily", "carrie"], 2);
    expect(split.length).toBe(3);
  });
});
