import React, { useState } from "react";
import { Dialog } from "@headlessui/react";

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    onAddToCart?: (itemId: number, customizations: Record<string, boolean>, note: string) => void;
}

const defaultOptions: Record<string, string[]> = {
    "Spice Level": ["Mild", "Medium", "Spicy"],
    "Extra Butter": ["Yes"],
    "Extra Paneer Gravy": ["Extra Paneer"],
    "Extra Chutney": ["Yes"],
    "Less Oil": ["Yes"],
    "No Ghee": ["Yes"],
    "Raita": ["Yes"],
    "Extra Chicken": ["Yes"],
    "Add Egg": ["Yes"],
    "No Onion": ["Yes"],
    "Extra Sauce": ["Yes"],
    "Extra Cream": ["Yes"],
    "Boneless": ["Yes"],
    Butter: ["Yes"],
    Crispy: ["Yes"],
    "Extra Syrup": ["Yes"],
    Warm: ["Yes"],
    "No Sugar": ["Yes"],
    "Extra Ice Cream": ["Yes"],
    "Strong Coffee": ["Yes"],
    "No Garlic": ["Yes"],
    "Tartar Sauce": ["Yes"],
};

const CustomizationModal: React.FC<CustomizationModalProps> = ({
    isOpen,
    onClose,
    item,
    onAddToCart,
}) => {
    const [customizations, setCustomizations] = useState<Record<string, boolean>>({});
    const [note, setNote] = useState("");

    const toggleOption = (option: string) => {
        setCustomizations((prev) => ({
            ...prev,
            [option]: !prev[option],
        }));
    };
    console.log("item", item);

    const handleAddToCart = () => {
        onAddToCart?.(item.id, customizations, note);
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="m-1 mt-0 fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />

            <div className="relative bg-white max-w-md w-full mx-auto p-6 rounded-2xl shadow-xl z-50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{item?.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl font-bold">×</button>
                </div>

                <p className="text-gray-600 mb-4">{item?.description}</p>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                    {/* {item.customizableOptions.map((groupLabel: string) => (
                        <div key={groupLabel}>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">{groupLabel}</h4>
                        {(defaultOptions[groupLabel] || ["Yes"]).map((opt) => {
                            const key = `${groupLabel} - ${opt}`;
                            return (
                            <label key={key} className="flex items-center space-x-3 mb-2 cursor-pointer">
                                <input
                                type="checkbox"
                                checked={!!customizations[key]}
                                onChange={() => toggleOption(key)}
                                className="form-checkbox h-4 w-4 text-orange-500"
                                />
                                <span className="text-gray-700 text-sm">{opt}</span>
                            </label>
                            );
                        })}
                        </div>
                    ))} */}
                    {item?.customizableOptions.map((option: string, key: any) => {
                        return (
                            <label key={key} className="flex items-center space-x-3 mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!customizations[key]}
                                    onChange={() => toggleOption(key)}
                                    className="form-checkbox h-4 w-4 text-orange-500"
                                />
                                <span className="text-gray-700 text-sm">{option}</span>
                            </label>
                        );
                    })}

                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Special Instructions</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="e.g. No onions, extra spicy"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleAddToCart}
                    className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-full text-lg font-semibold"
                >
                    Add to Cart
                </button>
            </div>
        </Dialog>
    );
};

export default CustomizationModal;
