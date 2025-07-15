const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ➕ Add item to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || quantity < 1)
    return res.status(400).json({ message: "Invalid product or quantity" });

  // If already in cart, update quantity
  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId: parseInt(productId) }
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { 
        product: {
          include: { category: true }
        }
      }
    });
    
    // Transform response to match frontend expectations
    const transformedItem = {
      ...updated,
      product: {
        ...updated.product,
        image_url: updated.product.imageUrl,
        stock_quantity: updated.product.availableStock,
        original_price: updated.product.originalPrice,
        reviews_count: updated.product.reviewsCount || 0
      }
    };
    
    return res.json(transformedItem);
  }

  const item = await prisma.cartItem.create({
    data: { userId, productId: parseInt(productId), quantity },
    include: { 
      product: {
        include: { category: true }
      }
    }
  });

  // Transform response to match frontend expectations
  const transformedItem = {
    ...item,
    product: {
      ...item.product,
      image_url: item.product.imageUrl,
      stock_quantity: item.product.availableStock,
      original_price: item.product.originalPrice,
      reviews_count: item.product.reviewsCount || 0
    }
  };

  res.status(201).json(transformedItem);
};

// 🧺 Get all cart items
exports.getCart = async (req, res) => {
  const userId = req.user.id;

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { 
      product: {
        include: { category: true }
      }
    }
  });

  // Transform response to match frontend expectations
  const transformedItems = items.map(item => ({
    ...item,
    product: {
      ...item.product,
      image_url: item.product.imageUrl,
      stock_quantity: item.product.availableStock,
      original_price: item.product.originalPrice,
      reviews_count: item.product.reviewsCount || 0
    }
  }));

  res.json(transformedItems);
};

// 🗑️ Remove from cart
exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id);

  const item = await prisma.cartItem.findUnique({ where: { id } });

  if (!item || item.userId !== userId)
    return res.status(403).json({ message: 'Unauthorized or not found' });

  await prisma.cartItem.delete({ where: { id } });
  res.json({ message: 'Item removed' });
};
