// JavaScript React UI Design for Wine Shop Billing Software
export default function WineShopBillingUIDesign() {
  const products = [
    { name: 'Royal Stag 750ml', code: 'RS750', price: '₹650', stock: 42 },
    { name: 'Blenders Pride 375ml', code: 'BP375', price: '₹420', stock: 18 },
    { name: 'Kingfisher Strong', code: 'KF650', price: '₹140', stock: 120 },
    { name: 'Magic Moments Vodka', code: 'MM750', price: '₹890', stock: 15 },
  ];

  const cart = [
    { item: 'Royal Stag 750ml', qty: 2, rate: '₹650', total: '₹1300' },
    { item: 'Kingfisher Strong', qty: 4, rate: '₹140', total: '₹560' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="grid grid-cols-12 gap-4">

        {/* Sidebar */}
        <div className="col-span-2 bg-black text-white rounded-3xl p-5 shadow-2xl">
          <h1 className="text-2xl font-bold mb-8 text-center">Wine POS</h1>

          <div className="space-y-3">
            {[
              'Dashboard',
              'POS Billing',
              'Item Master',
              'Barcode Print',
              'Stock Management',
              'Purchase',
              'Sales Report',
              'Customer Ledger',
              'Supplier Master',
              'Settings'
            ].map((item) => (
              <div
                key={item}
                className={`p-3 rounded-2xl cursor-pointer transition-all ${
                  item === 'POS Billing'
                    ? 'bg-red-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-10 space-y-4">

          {/* Top Header */}
          <div className="bg-white rounded-3xl p-4 shadow-md flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Wine Shop Billing Software</h2>
              <p className="text-gray-500">Modern Retail POS Interface</p>
            </div>

            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Search barcode / item name"
                className="border rounded-2xl px-4 py-3 w-80 outline-none"
              />

              <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold">
                New Bill
              </button>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              ['Today Sale', '₹1,45,320'],
              ['Total Bills', '168'],
              ['Stock Items', '2,845'],
              ['Low Stock', '23'],
            ].map(([title, value]) => (
              <div
                key={title}
                className="bg-white rounded-3xl p-5 shadow-md"
              >
                <p className="text-gray-500 text-sm">{title}</p>
                <h3 className="text-3xl font-bold mt-2">{value}</h3>
              </div>
            ))}
          </div>

          {/* POS Section */}
          <div className="grid grid-cols-12 gap-4">

            {/* Product List */}
            <div className="col-span-7 bg-white rounded-3xl p-4 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Product List</h3>

                <div className="flex gap-2">
                  <button className="bg-gray-100 px-4 py-2 rounded-xl">
                    Whisky
                  </button>
                  <button className="bg-gray-100 px-4 py-2 rounded-xl">
                    Beer
                  </button>
                  <button className="bg-gray-100 px-4 py-2 rounded-xl">
                    Vodka
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border">
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Barcode</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.code} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3">{product.code}</td>
                        <td className="p-3">{product.price}</td>
                        <td className="p-3">{product.stock}</td>
                        <td className="p-3">
                          <button className="bg-black text-white px-4 py-2 rounded-xl">
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billing Panel */}
            <div className="col-span-5 bg-white rounded-3xl p-4 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Current Bill</h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-sm">
                  Bill No: 1025
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-auto">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-2xl p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.item}</p>
                      <p className="text-sm text-gray-500">
                        {item.qty} × {item.rate}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">{item.total}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-5 pt-5 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹1860</span>
                </div>

                <div className="flex justify-between">
                  <span>GST</span>
                  <span>₹90</span>
                </div>

                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>₹1950</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button className="bg-green-600 text-white py-4 rounded-2xl font-bold text-lg">
                    Cash
                  </button>

                  <button className="bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg">
                    UPI/Card
                  </button>
                </div>

                <button className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg mt-3">
                  Print Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-3xl p-4 shadow-md flex justify-between text-gray-500 text-sm">
            <span>Retail Wine Shop Management System</span>
            <span>Barcode | GST | Inventory | Sales Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}