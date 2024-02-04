const categoryModel = require('../../models/categoryModel')

const addCategory = async (req, res) => {
    try {
        const categoryData = new categoryModel(req.body)
        await categoryData.save()
        res.status(201).send({
            success: true,
            message: "Category created!",
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error!",
            error: error.message,
        })
    }
}

const editCategory = async (req, res) => {
    try {
        const { categoryId } = req.params
        const categoryData = await categoryModel.findById(categoryId)
        if (categoryData) {
            categoryData.categoryName = req.body.categoryName
            await categoryData.save()
            res.status(200).send({
                success: true,
                message: "Category edited!"
            })
        } else {
            res.status(400).send({
                success: false,
                message: "Category not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error!",
            error: error.message,
        })
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params
        const categoryData = await categoryModel.findByIdAndDelete(categoryId)
        res.status(200).send({
            success: true,
            message: "Category deleted!"
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error!",
            error: error.message,
        })
    }
}

const allCategory = async (req, res) => {
    try {
        const categoryData = await categoryModel.find({}).select('categoryName')
        res.status(200).send({
            success: true,
            message: "All category",
            category: categoryData,
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error!",
            error: error.message,
        })
    }
}

module.exports = {
    addCategory,
    editCategory,
    deleteCategory,
    allCategory
}