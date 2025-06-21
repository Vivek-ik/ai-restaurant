// import React, { useState } from "react";
// import Button from "../components/ui/button/Button";
// import { DownloadIcon, PlusIcon } from "../icons";
// import { Table } from "../components/ui/table";
// import { Modal } from "../components/ui/modal";
// import Input from "../components/form/input/InputField";
// //   import { Tabs } from "@/components/ui/tabs";
// //   import { Button } from "@/components/ui/button";
// //   import { Table } from "@/components/ui/table";
// //   import { Modal } from "@/components/ui/modal";
// //   import { Input } from "@/components/ui/input";
// //   import { Download, Upload, Plus } from "lucide-react";

//   const Orders = () => {
//     const [activeTab, setActiveTab] = useState("all");
//     const [showModal, setShowModal] = useState(false);

//     const tabs = [
//       { label: "All Items", value: "all" },
//       { label: "Today’s Specials", value: "specials" },
//       { label: "Unavailable", value: "unavailable" },
//     ];

//     const sampleData = [
//       {
//         name: "Paneer Tikka",
//         price: "₹250",
//         category: "Indian",
//         tags: ["veg", "gluten-free"],
//         available: true,
//       },
//       {
//         name: "Pasta Alfredo",
//         price: "₹320",
//         category: "Italian",
//         tags: ["veg"],
//         available: false,
//       },
//     ];

//     return (
//       <div className="p-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-2xl font-semibold">Menu Management</h1>
//           <div className="space-x-2">
//             <Button variant="outline">
//                 {/* <Upload className="mr-2 h-4 w-4" /> */}
//                  Import Excel</Button>
//             <Button variant="outline"><DownloadIcon className="mr-2 h-4 w-4" /> Export Excel</Button>
//             <Button onClick={() => setShowModal(true)}><PlusIcon className="mr-2 h-4 w-4" /> Add Item</Button>
//           </div>
//         </div>

//         {/* <Tabs tabs={tabs} value={activeTab} onTabChange={setActiveTab} /> */}

//         <Table>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Price</th>
//               <th>Category</th>
//               <th>Tags</th>
//               <th>Availability</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sampleData
//               .filter(item => {
//                 if (activeTab === "specials") return item.tags.includes("special");
//                 if (activeTab === "unavailable") return !item.available;
//                 return true;
//               })
//               .map((item, idx) => (
//                 <tr key={idx}>
//                   <td>{item.name}</td>
//                   <td>{item.price}</td>
//                   <td>{item.category}</td>
//                   <td>
//                     {item.tags.map((tag, i) => (
//                       <span
//                         key={i}
//                         className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs mr-1"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </td>
//                   <td>
//                     <span
//                       className={`text-sm font-medium ${
//                         item.available ? "text-green-600" : "text-red-500"
//                       }`}
//                     >
//                       {item.available ? "Available" : "Unavailable"}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </Table>

//         <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
//           <h2 className="text-lg font-semibold mb-4">Add/Edit Menu Item</h2>
//           <div className="space-y-4">
//             <Input  placeholder="Enter item name" />
//             <Input  placeholder="Enter price" />
//             <Input  placeholder="e.g. Indian, Italian" />
//             <Input placeholder="e.g. veg, spicy" />
//             <Button className="w-full">Save Item</Button>
//           </div>
//         </Modal>
//       </div>
//     );
//   };

//   export default Orders;


'use client';
import { useState } from 'react';
import DataTable, { Column } from '../components/tables/BasicTables/BasicTableOne';
import Button from '../components/ui/button/Button';
import { Modal } from '../components/ui/modal';
import Input from '../components/form/input/InputField';
import PageMeta from '../components/common/PageMeta';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
// import DataTable, { Column } from "@/components/common/DataTable";
// import { Button } from "@/components/ui/button";

const columns: Column[] = [
    { header: "Name", accessor: "name" },
    { header: "Price", accessor: "price" },
    { header: "Category", accessor: "category" },
    { header: "Tags", accessor: "tags" },
    { header: "Availability", accessor: "availability", isBadge: true },
];

const dummyMenu = [
    {
        name: "Paneer Butter Masala",
        price: "₹250",
        category: "Main Course",
        tags: "Veg, Spicy",
        availability: "Available",
    },
    {
        name: "Chicken Biryani",
        price: "₹320",
        category: "Rice",
        tags: "Non-Veg, Spicy",
        availability: "Unavailable",
    },
    {
        name: "Cold Coffee",
        price: "₹120",
        category: "Beverages",
        tags: "Cold",
        availability: "Special",
    },
];

const MenuPage = () => {
    const [filter, setFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);

    const filteredData =
        filter === "All"
            ? dummyMenu
            : dummyMenu.filter((item) =>
                filter === "Today’s Specials"
                    ? item.availability === "Special"
                    : item.availability === "Unavailable"
            );

    return (
        <>
            <PageMeta
                title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />

            <PageBreadcrumb pageTitle="Profile" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-x-3">
                        {["All", "Today’s Specials", "Unavailable"].map((f) => (
                            <Button
                                key={f}
                                //   variant={filter === f ? "default" : "outline"}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </Button>
                        ))}
                    </div>
                    <div className="space-x-2">
                        <Button variant="outline">📤 Export</Button>
                        <Button variant="outline">📥 Import</Button>
                        <Button onClick={() => setShowModal(true)}>Add New Item</Button>

                    </div>
                </div>

                <DataTable data={filteredData} columns={columns} />

                <Modal className='m-50' isOpen={showModal} onClose={() => setShowModal(false)}>
                    <div className="w-[600px] m-auto space-y-4 p-6">
                        <h2 className="text-lg font-semibold mb-4">Add/Edit Menu Item</h2>
                        <Input placeholder="Enter item name" />
                        <Input placeholder="Enter price" />
                        <Input placeholder="e.g. Indian, Italian" />
                        <Input placeholder="e.g. veg, spicy" />
                        <Button className="w-full">Save Item</Button>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default MenuPage;
