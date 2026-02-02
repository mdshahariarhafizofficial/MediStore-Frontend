'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, ShoppingCart, Heart, Share2, Truck, 
  Shield, Clock, Package, ChevronLeft, AlertCircle,
  CheckCircle, Clock as ClockIcon, User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { medicineApi } from '@/lib/api/medicine';
import { cartApi } from '@/lib/api/cart';
import { orderApi } from '@/lib/api/order';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';

export default function MedicineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  // Fetch medicine details
  const { data: medicineData, isLoading, refetch } = useQuery({
    queryKey: ['medicine', medicineId],
    queryFn: () => medicineApi.getMedicineById(medicineId),
    enabled: !!medicineId,
  });

  const medicine = medicineData?.data;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () =>
      cartApi.addToCart({
        medicineId,
        quantity,
      }),
    onSuccess: (response) => {
      if (response.success) {
        addItem(response.data!);
        toast.success('Added to cart successfully!');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });

  // Add review mutation - FIXED VERSION
  const addReviewMutation = useMutation({
    mutationFn: () =>
      orderApi.addReview(medicineId, {
        rating: review.rating,
        comment: review.comment,
      }),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['medicine', medicineId] });

      // Snapshot the previous value
      const previousMedicine = queryClient.getQueryData(['medicine', medicineId]);

      // Optimistically update the cache
      if (previousMedicine && user) {
        const updatedMedicine = {
          ...previousMedicine,
          data: {
            ...previousMedicine.data,
            reviews: [
              {
                id: `temp-${Date.now()}`,
                rating: review.rating,
                comment: review.comment,
                customer: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                },
                createdAt: new Date().toISOString(),
              },
              ...(previousMedicine.data.reviews || []),
            ],
            reviewCount: (previousMedicine.data.reviewCount || 0) + 1,
            averageRating: calculateNewAverage(
              previousMedicine.data.averageRating || 0,
              previousMedicine.data.reviewCount || 0,
              review.rating
            ),
          },
        };
        
        queryClient.setQueryData(['medicine', medicineId], updatedMedicine);
      }

      return { previousMedicine };
    },
    onSuccess: (response) => {
      toast.success('Review submitted successfully!');
      setReview({ rating: 5, comment: '' });
      
      // Invalidate and refetch to get fresh data from server
      queryClient.invalidateQueries({
        queryKey: ['medicine', medicineId],
      });
      
      // Also refetch manually to ensure data is fresh
      refetch();
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMedicine) {
        queryClient.setQueryData(['medicine', medicineId], context.previousMedicine);
      }
      toast.error(error.message || 'Failed to submit review');
    },
  });

  // Helper function to calculate new average rating
  const calculateNewAverage = (currentAverage: number, currentCount: number, newRating: number) => {
    const totalSum = currentAverage * currentCount + newRating;
    const newCount = currentCount + 1;
    return totalSum / newCount;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      toast.error('Please login as a customer to add items to cart');
      router.push('/login');
      return;
    }

    if (medicine && medicine.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/checkout');
    }, 500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: medicine?.name,
        text: `Check out ${medicine?.name} on MediStore`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading medicine details..." />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Medicine Not Found</h2>
          <p className="text-gray-600 mb-6">The medicine you're looking for doesn't exist.</p>
          <Link href="/shop">
            <Button variant="primary">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = [medicine.imageUrl || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'];
  
  const features = [
    { icon: Shield, label: 'Authentic', description: 'Verified from manufacturer' },
    { icon: Truck, label: 'Fast Delivery', description: '2-4 hours in metro cities' },
    { icon: Clock, label: '24/7 Support', description: 'Always available to help' },
    { icon: Package, label: 'Easy Returns', description: '7-day return policy' },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
            <Link href="/shop" className="text-gray-500 hover:text-gray-700">
              Shop
            </Link>
            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
            <Link href={`/shop?category=${medicine.category?.id}`} className="text-gray-500 hover:text-gray-700">
              {medicine.category?.name}
            </Link>
            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
            <span className="text-gray-900 font-medium truncate">{medicine.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                {images[selectedImage] ? (
                  <Image
                    src={images[selectedImage]}
                    alt={medicine.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-20 w-20 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="flex space-x-3 mt-6">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? 'border-primary-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      {img ? (
                        <Image
                          src={img}
                          alt={`${medicine.name} ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{feature.label}</p>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{medicine.name}</h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(medicine.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-medium text-gray-700">
                        {(medicine.averageRating || 0).toFixed(1)}
                      </span>
                      <span className="mx-1 text-gray-400">•</span>
                      <span className="text-gray-500">
                        {medicine.reviewCount || 0} reviews
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                      {medicine.category?.name}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2.5 rounded-full ${
                      isWishlisted
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 mb-6">
                <Package className="h-4 w-4" />
                <span>Manufactured by <strong>{medicine.manufacturer}</strong></span>
                <span className="mx-1">•</span>
                <ClockIcon className="h-4 w-4" />
                <span>Expires: {new Date(medicine.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 mb-8 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatPrice(medicine.price)}
                  </p>
                  <p className="text-sm text-gray-500">Per unit</p>
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  medicine.stock > 20
                    ? 'bg-green-50 text-green-700'
                    : medicine.stock > 0
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {medicine.stock > 20
                    ? 'In Stock'
                    : medicine.stock > 0
                    ? `${medicine.stock} units left`
                    : 'Out of Stock'}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-6 py-2 text-lg font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                      disabled={quantity >= medicine.stock}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Max: {medicine.stock} units available
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  loading={addToCartMutation.isPending}
                  onClick={handleAddToCart}
                  disabled={medicine.stock === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={medicine.stock === 0}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {medicine.description}
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Manufacturer</p>
                  <p className="font-medium">{medicine.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                  <p className="font-medium">{new Date(medicine.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium">{medicine.category?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Seller</p>
                  <p className="font-medium">{medicine.seller?.name}</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Customer Reviews ({medicine.reviews?.length || 0})
              </h2>

              {/* Add Review Form */}
              {isAuthenticated && user?.role === 'CUSTOMER' && (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-3">Write a Review</h3>
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReview({ ...review, rating: star })}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    placeholder="Share your experience with this medicine..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
                    rows={3}
                  />
                  <Button
                    onClick={() => addReviewMutation.mutate()}
                    loading={addReviewMutation.isPending}
                    disabled={!review.comment.trim()}
                  >
                    Submit Review
                  </Button>
                </div>
              )}

              {/* Reviews List */}
              {(medicine.reviews && medicine.reviews.length > 0) ? (
                <div className="space-y-6">
                  {medicine.reviews.map((rev: any) => (
                    <div key={rev.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {rev.customer?.name || 'Anonymous User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rev.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-gray-600">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Medicines */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Related Medicines</h2>
            <Link href={`/shop?category=${medicine.category?.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          {/* Here you would fetch and display related medicines */}
          <div className="text-center py-12 bg-white rounded-2xl">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Related medicines will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}