import React, { useState, useEffect } from 'react';
import ARTryOn from '../ARTryOn';
import { authApi } from '../../api/authApi';
import { getAllWardrobes } from '../../api/wardrobeApi';

const ARTryOnPage = () => {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);

  useEffect(() => {
    const fetchWardrobeItems = async () => {
      try {
        setLoadingWardrobe(true);
        const user = authApi.getCurrentUser();

        if (!user) {
          console.error('No authenticated user found');
          setLoadingWardrobe(false);
          return;
        }

        // Fetch all wardrobes for the current user
        const response = await getAllWardrobes();
        const wardrobes = response.wardrobes || [];

        // Extract items from all wardrobes and flatten the array
        const allItems = wardrobes.flatMap((wardrobe) =>
          (wardrobe.items || []).map((item) => ({
            _id: item._id,
            item_name: item.name,
            image_url: item.imageUrl,
            category: item.category,
            color: item.colors?.[0] || '#9333ea', // Use first color or default
          }))
        );

        setWardrobeItems(allItems);
      } catch (error) {
        console.error('Error fetching wardrobe items:', error);
        setWardrobeItems([]);
      } finally {
        setLoadingWardrobe(false);
      }
    };

    fetchWardrobeItems();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      {loadingWardrobe ? (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          ></div>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Loading your wardrobe...
          </p>
        </div>
      ) : (
        <ARTryOn wardrobeItems={wardrobeItems} />
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ARTryOnPage;
