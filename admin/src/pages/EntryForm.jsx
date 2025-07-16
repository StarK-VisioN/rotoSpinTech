import React, { useState } from 'react';

const EntryForm = () => {
  const [clientName, setClientName] = useState('AEROMARINE');
  const [isEditingClient, setIsEditingClient] = useState(false);

  const [productModel, setProductModel] = useState('');
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
      productModel,
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
        className="flex flex-col w-1/2 gap-6 p-6 border rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Entry Product Form</h2>

        {/* Client Name with Edit */}
        <div>
          <label className="block mb-1 font-bold">Client's Name</label>
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

        {/* Row: Product Size, Color */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-bold">Product Model</label>
            <select
              value={productModel}
              onChange={(e) => setProductModel(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="" disabled>Select Model</option>
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

          <div className="flex-1">
            <label className="block mb-1 font-bold">Product Color</label>
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
        </div>

        {/* Row: Quantity & Date */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-bold">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="flex-1">
            <label className="block mb-1 font-bold">Date of Order</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
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




// import React, { useState } from 'react';

// const EntryForm = () => {
//   const [clientName, setClientName] = useState('xyz');
//   const [isEditingClient, setIsEditingClient] = useState(false);

//   const [productName, setProductName] = useState('');
//   const [customProductName, setCustomProductName] = useState('');

//   const [productSize, setProductSize] = useState('');
//   const [customProductSize, setCustomProductSize] = useState('');

//   const [productColor, setProductColor] = useState('');
//   const [customProductColor, setCustomProductColor] = useState('');

//   const [quantity, setQuantity] = useState('');
//   const [date, setDate] = useState('');

//   const handleClientEdit = () => setIsEditingClient(true);
//   const handleClientSave = () => setIsEditingClient(false);

//   const onSubmitHandler = (e) => {
//     e.preventDefault();

//     const finalProductName = productName === 'other' ? customProductName : productName;
//     const finalProductSize = productSize === 'other' ? customProductSize : productSize;
//     const finalProductColor = productColor === 'other' ? customProductColor : productColor;

//     console.log({
//       clientName,
//       productName: finalProductName,
//       productSize: finalProductSize,
//       productColor: finalProductColor,
//       quantity,
//       date,
//     });

//     // API call goes here
//   };

//   return (
//     <div className="flex items-center justify-center pt-15">
//       <form
//         onSubmit={onSubmitHandler}
//         className="flex flex-col w-1/2 gap-4 p-3 border rounded shadow"
//       >
//         <h2 className="text-2xl font-bold mb-4 text-center">Entry Product Form</h2>

//         {/* Client Name with Edit */}
//         <div>
//           <label className="block mb-1 font-bold">Client's Name</label>
//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={clientName}
//               disabled={!isEditingClient}
//               onChange={(e) => setClientName(e.target.value)}
//               className="flex-1 px-3 py-2 border rounded"
//             />
//             {isEditingClient ? (
//               <button
//                 type="button"
//                 onClick={handleClientSave}
//                 className="px-2 py-1 bg-green-500 text-white rounded"
//               >
//                 Save
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 onClick={handleClientEdit}
//                 className="px-2 py-1 bg-blue-500 text-white rounded"
//               >
//                 Edit
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Product Name, Size, Color in single line */}
//         <div className="flex flex-wrap gap-4">
//           {/* Product Name */}
//           <div className="flex-1 min-w-[200px]">
//             <label className="block mb-1 font-bold">Product Name</label>
//             <select
//               value={productName}
//               onChange={(e) => setProductName(e.target.value)}
//               className="w-full px-3 py-2 border rounded"
//               required
//             >
//               <option value="" disabled>Select Product</option>
//               <option value="a">a</option>
//               <option value="b">b</option>
//               <option value="c">c</option>
//               <option value="other">Other</option>
//             </select>
//             {productName === 'other' && (
//               <input
//                 type="text"
//                 placeholder="Enter custom product name"
//                 value={customProductName}
//                 onChange={(e) => setCustomProductName(e.target.value)}
//                 className="w-full px-3 py-2 border rounded mt-2"
//                 required
//               />
//             )}
//           </div>

//           {/* Product Size */}
//           <div className="flex-1 min-w-[200px]">
//             <label className="block mb-1 font-bold">Product Size</label>
//             <select
//               value={productSize}
//               onChange={(e) => setProductSize(e.target.value)}
//               className="w-full px-3 py-2 border rounded"
//               required
//             >
//               <option value="" disabled>Select Size</option>
//               <option value="750">750</option>
//               <option value="1250">1250</option>
//               <option value="1500">1500</option>
//               <option value="1750">1750</option>
//               <option value="2250">2250</option>
//               <option value="3000">3000</option>
//               <option value="2600">2600</option>
//               <option value="2000">2000</option>
//               <option value="other">Other</option>
//             </select>
//             {productSize === 'other' && (
//               <input
//                 type="text"
//                 placeholder="Enter custom size"
//                 value={customProductSize}
//                 onChange={(e) => setCustomProductSize(e.target.value)}
//                 className="w-full px-3 py-2 border rounded mt-2"
//                 required
//               />
//             )}
//           </div>

//           {/* Product Color */}
//           <div className="flex-1 min-w-[200px]">
//             <label className="block mb-1 font-bold">Product Color</label>
//             <select
//               value={productColor}
//               onChange={(e) => setProductColor(e.target.value)}
//               className="w-full px-3 py-2 border rounded"
//               required
//             >
//               <option value="" disabled>Select Color</option>
//               <option value="red">red</option>
//               <option value="green">green</option>
//               <option value="yellow">yellow</option>
//               <option value="other">Other</option>
//             </select>
//             {productColor === 'other' && (
//               <input
//                 type="text"
//                 placeholder="Enter custom color"
//                 value={customProductColor}
//                 onChange={(e) => setCustomProductColor(e.target.value)}
//                 className="w-full px-3 py-2 border rounded mt-2"
//                 required
//               />
//             )}
//           </div>
//         </div>

//         {/* Quantity and Date in single line */}
//         <div className="flex gap-4">
//           <div className="flex-1">
//             <label className="block mb-1 font-bold">Quantity</label>
//             <input
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               className="w-full px-3 py-2 border rounded"
//               required
//             />
//           </div>

//           <div className="flex-1">
//             <label className="block mb-1 font-bold">Date of Order</label>
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               className="w-full px-3 py-2 border rounded"
//               required
//             />
//           </div>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 transition-all duration-150 active:scale-95"
//         >
//           Submit
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EntryForm;
