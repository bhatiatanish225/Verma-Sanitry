const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCategories = async (req, res) => {
  const categories = await prisma.category.findMany();
  
  // Transform response to match frontend expectations
  const transformedCategories = categories.map(category => ({
    ...category,
    image_url: category.imageUrl // Frontend expects image_url
  }));
  
  res.json(transformedCategories);
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
  
  if (!category) return res.status(404).json({ message: "Category not found" });
  
  // Transform response to match frontend expectations
  const transformedCategory = {
    ...category,
    image_url: category.imageUrl
  };
  
  res.json(transformedCategory);
};

exports.createCategory = async (req, res) => {
  const { name, description, imageUrl, image_url } = req.body;
  
  // Use frontend field name if provided, otherwise use backend name
  const finalImageUrl = image_url || imageUrl;
  
  const category = await prisma.category.create({ 
    data: { 
      name, 
      description,
      imageUrl: finalImageUrl
    } 
  });
  
  // Transform response to match frontend expectations
  const transformedCategory = {
    ...category,
    image_url: category.imageUrl
  };
  
  res.status(201).json(transformedCategory);
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl, image_url } = req.body;
  
  // Use frontend field name if provided, otherwise use backend name
  const finalImageUrl = image_url || imageUrl;
  
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (finalImageUrl !== undefined) updateData.imageUrl = finalImageUrl;
  
  const category = await prisma.category.update({ 
    where: { id: parseInt(id) }, 
    data: updateData 
  });
  
  // Transform response to match frontend expectations
  const transformedCategory = {
    ...category,
    image_url: category.imageUrl
  };
  
  res.json(transformedCategory);
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Category deleted" });
};
