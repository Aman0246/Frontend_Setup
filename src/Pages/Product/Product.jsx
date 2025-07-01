import React from 'react'
import ProductForm from './ProductForm';
import { useState } from 'react';

export default function Product() {
    const [showForm, setShowForm] = useState(true);
    const [editProduct, setEditProduct] = useState(null);

    // Mock data
    const mockCategories = [
        { id: '1', name: 'Electronics' },
        { id: '2', name: 'Clothing' },
        { id: '3', name: 'Home & Garden' }
    ];

    const mockSubcategories = [
        { id: '11', name: 'Smartphones', parentId: '1' },
        { id: '12', name: 'Laptops', parentId: '1' },
        { id: '21', name: 'Men\'s Clothing', parentId: '2' },
        { id: '22', name: 'Women\'s Clothing', parentId: '2' },
        { id: '31', name: 'Furniture', parentId: '3' },
        { id: '32', name: 'Garden Tools', parentId: '3' }
    ];

    const mockAttributeKeys = [
        { id: 'k1', name: 'Brand' },
        { id: 'k2', name: 'Color' },
        { id: 'k3', name: 'Size' },
        { id: 'k4', name: 'Material' }
    ];

    const mockAttributeValues = [
        { id: 'v1', keyId: 'k1', value: 'Apple' },
        { id: 'v2', keyId: 'k1', value: 'Samsung' },
        { id: 'v3', keyId: 'k1', value: 'Sony' },
        { id: 'v4', keyId: 'k2', value: 'Red' },
        { id: 'v5', keyId: 'k2', value: 'Blue' },
        { id: 'v6', keyId: 'k2', value: 'Black' },
        { id: 'v7', keyId: 'k3', value: 'Small' },
        { id: 'v8', keyId: 'k3', value: 'Medium' },
        { id: 'v9', keyId: 'k3', value: 'Large' },
        { id: 'v10', keyId: 'k4', value: 'Cotton' },
        { id: 'v11', keyId: 'k4', value: 'Polyester' },
        { id: 'v12', keyId: 'k4', value: 'Leather' }
    ];

    const handleSubmit = async (formData) => {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Submitting product:', formData);

                // Simulate success/error
                if (Math.random() > 0.1) { // 90% success rate
                    alert(editProduct ? 'Product updated successfully!' : 'Product created successfully!');
                    setShowForm(false);
                    resolve();
                } else {
                    reject(new Error('Failed to save product. Please try again.'));
                }
            }, 2000);
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditProduct(null);
    };

    const handleEdit = () => {
        // Mock product data for editing
        const mockProduct = {
            id: '123',
            name: 'iPhone 14 Pro',
            type: PRODUCT_TYPE.SELL,
            categoryId: '1',
            subcategoryId: '11',
            condition: PRODUCT_CONDITION.USED,
            price: 999,
            deliveryMode: DELIVERY_MODE.BOTH,
            pickupAddress: '123 Main Street, City',
            attributes: [
                { key: 'k1', value: 'v1' }, // Brand: Apple
                { key: 'k2', value: 'v6' }  // Color: Black
            ],
            location: {
                type: 'Point',
                coordinates: [-122.4194, 37.7749] // San Francisco
            },
            images: []
        };

        setEditProduct(mockProduct);
        setShowForm(true);
    };

    if (!showForm) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Management</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Create New Product
                        </button>
                        <button
                            onClick={handleEdit}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Edit Sample Product
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <ProductForm
                product={editProduct}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                categories={mockCategories}
                subcategories={mockSubcategories}
                attributeKeys={mockAttributeKeys}
                attributeValues={mockAttributeValues}
            />
        </div>
    )
}



