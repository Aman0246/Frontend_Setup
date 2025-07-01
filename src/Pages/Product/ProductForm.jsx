import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Plus, Upload, MapPin } from 'lucide-react';





// Mock constants - in real app, import from your utils
const PRODUCT_TYPE = {
    SELL: 'SELL',
    RENT: 'RENT',
    AUCTION: 'AUCTION'
};

const PRODUCT_CONDITION = {
    NEW: 'NEW',
    USED: 'USED',
    REFURBISHED: 'REFURBISHED'
};

const DELIVERY_MODE = {
    SELLER_DELIVERY: 'SELLER_DELIVERY',
    BUYER_PICKUP: 'BUYER_PICKUP',
    BOTH: 'BOTH'
};

const RENT_DURATION = {
    1: 1,
    3: 3,
    6: 6,
    12: 12
};



export default function ProductForm({ product = null, onSubmit, onCancel, categories = [], subcategories = [], attributeKeys = [], attributeValues = [] }) {

    const isEdit = !!product;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: PRODUCT_TYPE.SELL,
        categoryId: '',
        subcategoryId: '',
        condition: '',
        price: '',
        rentDetails: {
            rentPrice: '',
            duration: '',
            securityAmount: ''
        },
        auctionDetails: {
            startPrice: '',
            reservePrice: '',
            bidIncrement: '',
            startTime: '',
            endTime: ''
        },
        deliveryMode: '',
        pickupAddress: '',
        attributes: [],
        location: {
            type: 'Point',
            coordinates: [0, 0]
        },
        images: []
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [newAttribute, setNewAttribute] = useState({ key: '', value: '' });

    // Initialize form with product data if editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                type: product.type || PRODUCT_TYPE.SELL,
                categoryId: product.categoryId || '',
                subcategoryId: product.subcategoryId || '',
                condition: product.condition || '',
                price: product.price || '',
                rentDetails: {
                    rentPrice: product.rentDetails?.rentPrice || '',
                    duration: product.rentDetails?.duration || '',
                    securityAmount: product.rentDetails?.securityAmount || ''
                },
                auctionDetails: {
                    startPrice: product.auctionDetails?.startPrice || '',
                    reservePrice: product.auctionDetails?.reservePrice || '',
                    bidIncrement: product.auctionDetails?.bidIncrement || '',
                    startTime: product.auctionDetails?.startTime ? new Date(product.auctionDetails.startTime).toISOString().slice(0, 16) : '',
                    endTime: product.auctionDetails?.endTime ? new Date(product.auctionDetails.endTime).toISOString().slice(0, 16) : ''
                },
                deliveryMode: product.deliveryMode || '',
                pickupAddress: product.pickupAddress || '',
                attributes: product.attributes || [],
                location: product.location || { type: 'Point', coordinates: [0, 0] },
                images: product.images || []
            });
        }
    }, [product]);

    // Validation functions
    const validateField = (name, value, formData) => {
        const errors = {};

        switch (name) {
            case 'name':
                if (!value.trim()) errors.name = 'Product name is required';
                break;

            case 'type':
                if (!Object.values(PRODUCT_TYPE).includes(value)) {
                    errors.type = 'Invalid product type';
                }
                break;

            case 'categoryId':
                if (!value) errors.categoryId = 'Category is required';
                break;

            case 'subcategoryId':
                if (!value) errors.subcategoryId = 'Subcategory is required';
                break;

            case 'condition':
                if (!Object.values(PRODUCT_CONDITION).includes(value)) {
                    errors.condition = 'Product condition is required';
                }
                break;

            case 'price':
                if (formData.type === PRODUCT_TYPE.SELL) {
                    if (!value || value < 0) errors.price = 'Valid price is required for sell products';
                }
                break;

            case 'rentDetails':
                if (formData.type === PRODUCT_TYPE.RENT) {
                    if (!value.rentPrice || value.rentPrice < 0) {
                        errors['rentDetails.rentPrice'] = 'Rent price is required';
                    }
                    if (!value.duration || !Object.values(RENT_DURATION).includes(Number(value.duration))) {
                        errors['rentDetails.duration'] = 'Valid duration is required';
                    }
                    if (value.securityAmount !== '' && value.securityAmount < 0) {
                        errors['rentDetails.securityAmount'] = 'Security amount must be positive';
                    }
                }
                break;

            case 'auctionDetails':
                if (formData.type === PRODUCT_TYPE.AUCTION) {
                    if (!value.startPrice || value.startPrice < 0) {
                        errors['auctionDetails.startPrice'] = 'Start price is required';
                    }
                    if (!value.reservePrice || value.reservePrice <= value.startPrice) {
                        errors['auctionDetails.reservePrice'] = 'Reserve price must be greater than start price';
                    }
                    if (!value.bidIncrement || value.bidIncrement < 1) {
                        errors['auctionDetails.bidIncrement'] = 'Bid increment must be at least 1';
                    }
                    if (!value.startTime) {
                        errors['auctionDetails.startTime'] = 'Start time is required';
                    }
                    if (!value.endTime || new Date(value.endTime) <= new Date(value.startTime)) {
                        errors['auctionDetails.endTime'] = 'End time must be after start time';
                    }
                }
                break;

            case 'deliveryMode':
                if (!Object.values(DELIVERY_MODE).includes(value)) {
                    errors.deliveryMode = 'Delivery mode is required';
                }
                break;

            case 'pickupAddress':
                if (formData.deliveryMode === DELIVERY_MODE.BUYER_PICKUP && !value.trim()) {
                    errors.pickupAddress = 'Pickup address is required when buyer pickup is selected';
                }
                break;

            case 'location':
                if (!value.coordinates || value.coordinates.length !== 2) {
                    errors.location = 'Valid coordinates are required';
                } else {
                    const [lng, lat] = value.coordinates;
                    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
                        errors.location = 'Coordinates must be within valid ranges';
                    }
                }
                break;
        }

        return errors;
    };

    const validateForm = () => {
        let allErrors = {};

        // Validate all fields
        Object.keys(formData).forEach(key => {
            const fieldErrors = validateField(key, formData[key], formData);
            allErrors = { ...allErrors, ...fieldErrors };
        });

        setErrors(allErrors);
        return Object.keys(allErrors).length === 0;
    };

    // Event handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));

        // Clear error for this field
        const errorKey = `${section}.${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: '' }));
        }
    };

    const handleLocationChange = (index, value) => {
        const newCoordinates = [...formData.location.coordinates];
        newCoordinates[index] = parseFloat(value) || 0;

        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                coordinates: newCoordinates
            }
        }));
    };

    const addAttribute = () => {
        if (newAttribute.key && newAttribute.value) {
            setFormData(prev => ({
                ...prev,
                attributes: [...prev.attributes, { ...newAttribute }]
            }));
            setNewAttribute({ key: '', value: '' });
        }
    };

    const removeAttribute = (index) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        // In real app, upload to cloud storage and get URLs
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...imageUrls]
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Prepare data for submission
            const submitData = { ...formData };

            // Convert string numbers to actual numbers
            if (submitData.price) submitData.price = parseFloat(submitData.price);

            if (submitData.type === PRODUCT_TYPE.RENT) {
                submitData.rentDetails.rentPrice = parseFloat(submitData.rentDetails.rentPrice);
                submitData.rentDetails.duration = parseInt(submitData.rentDetails.duration);
                if (submitData.rentDetails.securityAmount) {
                    submitData.rentDetails.securityAmount = parseFloat(submitData.rentDetails.securityAmount);
                }
            }

            if (submitData.type === PRODUCT_TYPE.AUCTION) {
                submitData.auctionDetails.startPrice = parseFloat(submitData.auctionDetails.startPrice);
                submitData.auctionDetails.reservePrice = parseFloat(submitData.auctionDetails.reservePrice);
                submitData.auctionDetails.bidIncrement = parseFloat(submitData.auctionDetails.bidIncrement);
                submitData.auctionDetails.startTime = new Date(submitData.auctionDetails.startTime).toISOString();
                submitData.auctionDetails.endTime = new Date(submitData.auctionDetails.endTime).toISOString();
            }

            await onSubmit(submitData);
        } catch (error) {
            console.error('Form submission error:', error);
            setErrors({ submit: error.message || 'An error occurred while saving the product' });
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Update Product' : 'Create New Product'}
                </h2>
                <p className="text-gray-600 mt-1">
                    {isEdit ? 'Modify your product details' : 'Fill in the details to list your product'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter product name"
                        />
                        {errors.name && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Type *
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            {Object.values(PRODUCT_TYPE).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.type && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.type}
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.categoryId}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subcategory *
                        </label>
                        <select
                            name="subcategoryId"
                            value={formData.subcategoryId}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subcategoryId ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select Subcategory</option>
                            {subcategories.filter(sub => sub.parentId === formData.categoryId).map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                        {errors.subcategoryId && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.subcategoryId}
                            </div>
                        )}
                    </div>
                </div>

                {/* Condition and Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Condition *
                        </label>
                        <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.condition ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select Condition</option>
                            {Object.values(PRODUCT_CONDITION).map(condition => (
                                <option key={condition} value={condition}>{condition}</option>
                            ))}
                        </select>
                        {errors.condition && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.condition}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Mode *
                        </label>
                        <select
                            name="deliveryMode"
                            value={formData.deliveryMode}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deliveryMode ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select Delivery Mode</option>
                            {Object.values(DELIVERY_MODE).map(mode => (
                                <option key={mode} value={mode}>{mode.replace('_', ' ')}</option>
                            ))}
                        </select>
                        {errors.deliveryMode && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.deliveryMode}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pickup Address (conditional) */}
                {formData.deliveryMode === DELIVERY_MODE.BUYER_PICKUP && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pickup Address *
                        </label>
                        <textarea
                            name="pickupAddress"
                            value={formData.pickupAddress}
                            onChange={handleInputChange}
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pickupAddress ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter pickup address"
                        />
                        {errors.pickupAddress && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.pickupAddress}
                            </div>
                        )}
                    </div>
                )}

                {/* Price Section */}
                {formData.type === PRODUCT_TYPE.SELL && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter price"
                        />
                        {errors.price && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.price}
                            </div>
                        )}
                    </div>
                )}

                {/* Rent Details */}
                {formData.type === PRODUCT_TYPE.RENT && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Rent Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rent Price *
                                </label>
                                <input
                                    type="number"
                                    value={formData.rentDetails.rentPrice}
                                    onChange={(e) => handleNestedChange('rentDetails', 'rentPrice', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['rentDetails.rentPrice'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Monthly rent"
                                />
                                {errors['rentDetails.rentPrice'] && (
                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors['rentDetails.rentPrice']}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (months) *
                                </label>
                                <select
                                    value={formData.rentDetails.duration}
                                    onChange={(e) => handleNestedChange('rentDetails', 'duration', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['rentDetails.duration'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Duration</option>
                                    {Object.values(RENT_DURATION).map(duration => (
                                        <option key={duration} value={duration}>{duration} month{duration > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                                {errors['rentDetails.duration'] && (
                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors['rentDetails.duration']}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Security Amount
                                </label>
                                <input
                                    type="number"
                                    value={formData.rentDetails.securityAmount}
                                    onChange={(e) => handleNestedChange('rentDetails', 'securityAmount', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['rentDetails.securityAmount'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Auto-calculated if empty"
                                />
                                {errors['rentDetails.securityAmount'] && (
                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors['rentDetails.securityAmount']}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Auction Details */}
                {formData.type === PRODUCT_TYPE.AUCTION && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Auction Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Price *
                                </label>
                                <input
                                    type="number"
                                    value={formData.auctionDetails.startPrice}
                                    onChange={(e) => handleNestedChange('auctionDetails', 'startPrice', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['auctionDetails.startPrice'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors['auctionDetails.startPrice'] && (
                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors['auctionDetails.startPrice']}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reserve Price *
                                </label>
                                <input
                                    type="number"
                                    value={formData.auctionDetails.reservePrice}
                                    onChange={(e) => handleNestedChange('auctionDetails', 'reservePrice', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['auctionDetails.reservePrice'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors['auctionDetails.reservePrice'] && (
                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors['auctionDetails.reservePrice']}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bid Increment *
                                </label>
                                <input
                                    type="number"
                                    value={formData.auctionDetails.bidIncrement}
                                    onChange={(e) => handleNestedChange('auctionDetails', 'bidIncrement', e.target.value)}
                                    min="1"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['auctionDetails.bidIncrement'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors['auctionDetails.bidIncrement'] && (
                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors['auctionDetails.bidIncrement']}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.auctionDetails.startTime}
                                    onChange={(e) => handleNestedChange('auctionDetails', 'startTime', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['auctionDetails.startTime'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors['auctionDetails.startTime'] && (
                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors['auctionDetails.startTime']}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.auctionDetails.endTime}
                                    onChange={(e) => handleNestedChange('auctionDetails', 'endTime', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['auctionDetails.endTime'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors['auctionDetails.endTime'] && (
                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors['auctionDetails.endTime']}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Location */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Location *</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Longitude
                            </label>
                            <input
                                type="number"
                                value={formData.location.coordinates[0]}
                                onChange={(e) => handleLocationChange(0, e.target.value)}
                                min="-180"
                                max="180"
                                step="any"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter longitude"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Latitude
                            </label>
                            <input
                                type="number"
                                value={formData.location.coordinates[1]}
                                onChange={(e) => handleLocationChange(1, e.target.value)}
                                min="-90"
                                max="90"
                                step="any"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter latitude"
                            />
                        </div>
                    </div>
                    {errors.location && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.location}
                        </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Current: [{formData.location.coordinates[0]}, {formData.location.coordinates[1]}]
                    </div>
                </div>

                {/* Attributes */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Product Attributes</h3>

                    {/* Add new attribute */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attribute Key
                            </label>
                            <select
                                value={newAttribute.key}
                                onChange={(e) => setNewAttribute(prev => ({ ...prev, key: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Attribute</option>
                                {attributeKeys.map(key => (
                                    <option key={key.id} value={key.id}>{key.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attribute Value
                            </label>
                            <select
                                value={newAttribute.value}
                                onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!newAttribute.key}
                            >
                                <option value="">Select Value</option>
                                {attributeValues
                                    .filter(val => val.keyId === newAttribute.key)
                                    .map(val => (
                                        <option key={val.id} value={val.id}>{val.value}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={addAttribute}
                                disabled={!newAttribute.key || !newAttribute.value}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Attribute
                            </button>
                        </div>
                    </div>

                    {/* Display current attributes */}
                    {formData.attributes.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Current Attributes:</h4>
                            {formData.attributes.map((attr, index) => {
                                const keyName = attributeKeys.find(k => k.id === attr.key)?.name || attr.key;
                                const valueName = attributeValues.find(v => v.id === attr.value)?.value || attr.value;

                                return (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                                        <span className="text-sm">
                                            <strong>{keyName}:</strong> {valueName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttribute(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Images */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Images
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Display uploaded images */}
                    {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={image}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="text-red-800">{errors.submit}</span>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {isEdit ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            isEdit ? 'Update Product' : 'Create Product'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}






