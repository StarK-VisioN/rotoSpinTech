import React, { useState } from 'react';

const EntryForm = () => {
  const [clientName, setClientName] = useState('xyz');
  const [isEditingClient, setIsEditingClient] = useState(false);

  const [productName, setProductName] = useState('');
  const [productSize, setProductSize] = useState('');
  const [productColor, setProductColor] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');

  const handleClientEdit = () => {
    setIsEditingClient(true);
  };

  const handleClientSave = () => {
    setIsEditingClient(false);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    console.log({
      clientName,
      productName,
      productSize,
      productColor,
      quantity,
      date,
    });
    // API call
  };

  return (
    <div className="flex items-center justify-center pt-15">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col w-1/2 gap-4  border rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Entry Product Form</h2>

        {/* Client Name with Edit */}
        <div>
          <label className="block mb-1">Client's Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={clientName}
              disabled={!isEditingClient}
              onChange={(e) => setClientName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            {isEditingClient ? (
              <button
                type="button"
                onClick={handleClientSave}
                className="px-2 py-1 bg-green-500 text-white rounded"
              >
                Save
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClientEdit}
                className="px-2 py-1 bg-blue-500 text-white rounded"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block mb-1">Product Name</label>
          <select
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="" disabled>Select Product</option>
            <option value="a">a</option>
            <option value="b">b</option>
            <option value="c">c</option>
          </select>
        </div>

        {/* Product Size */}
        <div>
          <label className="block mb-1">Product Size</label>
          <select
            value={productSize}
            onChange={(e) => setProductSize(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="" disabled>Select Size</option>
            <option value="750">750</option>
            <option value="1250">1250</option>
            <option value="1500">1500</option>
            <option value="1750">1750</option>
            <option value="2250">2250</option>
            <option value="3000">3000</option>
            <option value="2600">2600</option>
            <option value="2000">2000</option>
          </select>
        </div>

        {/* Product Color */}
        <div>
          <label className="block mb-1">Product Color</label>
          <select
            value={productColor}
            onChange={(e) => setProductColor(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="" disabled>Select Color</option>
            <option value="red">red</option>
            <option value="green">green</option>
            <option value="yellow">yellow</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1">Date of Order</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 transition-all duration-150 active:scale-95"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EntryForm;
