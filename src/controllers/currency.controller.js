import Con from "../models/concurrency.model.js";

export const getUSDRate = async () => {
  try {
    let data = await Con.findOne({ id: 0 });
    if (!data) {
      let newData = new Con({ val: 11000 });
      data = newData;
      await newData.save();
    }
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const setUSDRate = async (val) => {
  try {
    let data = await Con.findOneAndUpdate({ id: 0 }, { val: val });
    return data;
  } catch (err) {
    console.log(err);
  }
};
