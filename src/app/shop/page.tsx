'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, Filter, SlidersHorizontal, Grid3X3, List, 
  ChevronLeft, ChevronRight, Package, Star, Truck, 
  Shield, Clock, TrendingUp, 
  ShoppingCart
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import MedicineCard from '@/components/medicine/MedicineCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { medicineApi } from '@/lib/api/medicine';
import { Category } from '@/lib/types';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => medicineApi.getCategories(),
  });

  // Fetch medicines with filters
  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['medicines', search, category, minPrice, maxPrice, sortBy, sortOrder, page],
    queryFn: () =>
      medicineApi.getAllMedicines({
        search,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: page.toString(),
        limit: '12',
      }),
  });

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (page > 1) params.set('page', page.toString());
    
    router.push(`/shop?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
    router.push('/shop');
  };

  useEffect(() => {
    handleFilter();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Newest', icon: Clock },
    { value: 'price', label: 'Price', icon: TrendingUp },
    { value: 'name', label: 'Name', icon: Package },
  ];

  const features = [
    { icon: Shield, text: '100% Authentic', color: 'text-blue-600 bg-blue-50' },
    { icon: Truck, text: 'Fast Delivery', color: 'text-green-600 bg-green-50' },
    { icon: Star, text: 'Top Rated', color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Medicine Shop</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Discover authentic medicines from trusted manufacturers. Your health is our priority.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicines, brands, or symptoms..."
                className="w-full px-6 py-4 pl-14 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <button
                onClick={handleFilter}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-800 text-white px-6 py-2.5 rounded-xl hover:bg-primary-900 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg flex items-center space-x-4"
            >
              <div className={`p-3 rounded-lg ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{feature.text}</p>
                <p className="text-sm text-gray-500">Guaranteed</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </h2>
                <button
                  onClick={handleReset}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategory('')}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      category === '' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categoriesData?.data?.map((cat: Category) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        category === cat.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{cat.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {cat._count?.medicines || 0}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Min</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Max</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleFilter}
                    className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Apply Price Filter
                  </button>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Sort By</h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                        sortBy === option.value ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <option.icon className="h-4 w-4 mr-3" />
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <span className="ml-auto">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      sortOrder === 'asc' ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Ascending
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      sortOrder === 'desc' ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Descending
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    All Medicines
                    {medicinesData?.data?.pagination?.total && (
                      <span className="text-gray-500 text-lg font-normal ml-2">
                        ({medicinesData.data.pagination.total} products)
                      </span>
                    )}
                  </h2>
                  {search && (
                    <p className="text-gray-600 mt-1">
                      Search results for: <span className="font-semibold">"{search}"</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </button>

                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
                    >
                      <Grid3X3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Medicines Grid/List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <LoadingSpinner size="lg" text="Loading medicines..." />
              </div>
            ) : medicinesData?.data?.medicines?.length ? (
              <>
                <div className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                }`}>
                  {medicinesData.data.medicines.map((medicine: any) => (
                    viewMode === 'grid' ? (
                      <MedicineCard key={medicine.id} medicine={medicine} />
                    ) : (
                      <div key={medicine.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/4">
                            <div className="relative h-48 bg-gray-100 rounded-xl overflow-hidden">
                              {medicine.imageUrl ? (
                                <img
                                  src={medicine.imageUrl}
                                  alt={medicine.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="md:w-3/4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{medicine.name}</h3>
                                <p className="text-gray-600 mb-3">{medicine.description}</p>
                              </div>
                              <div className="text-2xl font-bold text-primary-600">
                                ৳{medicine.price}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                                {medicine.category?.name}
                              </span>
                              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                Stock: {medicine.stock}
                              </span>
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                {medicine.manufacturer}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="ml-1 font-medium">{medicine.averageRating?.toFixed(1) || '0.0'}</span>
                                  <span className="text-gray-500 text-sm ml-1">
                                    ({medicine.reviewCount || 0} reviews)
                                  </span>
                                </div>
                                <button className="text-primary-600 hover:text-primary-700 font-medium">
                                  View Details
                                </button>
                              </div>
                              <Button variant="primary" size="md">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Pagination */}
                {medicinesData.data.pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, medicinesData.data.pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (medicinesData.data.pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= medicinesData.data.pagination.totalPages - 2) {
                          pageNum = medicinesData.data.pagination.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium ${
                              page === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === medicinesData.data.pagination.totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="ml-6 flex items-center text-gray-600">
                      <span className="text-sm">
                        Page {page} of {medicinesData.data.pagination.totalPages}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-sm">
                        {medicinesData.data.pagination.total} total medicines
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Medicines Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {search
                    ? `No medicines found for "${search}". Try a different search term.`
                    : 'No medicines available at the moment. Please check back later.'}
                </p>
                {search && (
                  <Button onClick={handleReset} variant="outline">
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}