const bookModel = require('../../models/booksModel');
const categoryModel = require('../../models/categoryModel')
const reviewModel = require('../../models/reviewsModel')
const userModel = require('../../models/userModel')

const addBook = async (req, res) => {
    try {
        const isCategoryExist = await categoryModel.findOne({
            categoryName: req.body.bookCategory
        })
        if (!isCategoryExist && req.body.bookCategory === "common") {
            return res.status(401).send({
                success: false,
                message: "Category not exist in database",
            })
        }
        const newBook = new bookModel({
            bookName: req.body.bookName,
            bookDescription: req.body.bookDescription,
            bookAuthor: req.body.bookAuthor,
            bookCategory: req.body.bookCategory,
            bookCost: req.body.bookCost
        });
        await newBook.save();
        res.status(201).json({
            success: true,
            message: "Book added successfully",
            data: newBook,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error: Unable to add the book",
            error: error.message,
        });
    }
};

const editBook = async (req, res) => {
    try {
        const { bookId } = req.params
        const bookData = await bookModel.findByIdAndUpdate(bookId, {
            bookName: req.body.bookName || undefined,
            bookDescription: req.body.bookDescription || undefined,
            bookAuthor: req.body.bookAuthor || undefined,
        }, {
            new: true,
        })
        if (bookData) {
            return res.status(200).send({
                success: true,
                message: "Book updated!",
                bookData: bookData,
            })
        }
        res.status(401).send({
            success: false,
            message: "Book not found!"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error",
            error: error.message,
        });
    }
}

const deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params
        const bookData = await bookModel.findByIdAndDelete(bookId);
        if (bookData) {
            return res.status(200).send({
                success: true,
                message: "Book deleted!",
                bookDeleteData: bookData,
            })
        }
        res.status(401).send({
            success: false,
            message: "Book not found!"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error",
            error: error.message,
        });
    }
}

const searchBookByName = async (req, res) => {
    try {
        const { bookName } = req.params
        const bookSearchData = await bookModel.find({ bookName: { $regex: `^${bookName}`, $options: "i" } })
            .select('bookName');
        if (bookSearchData.length <= 0) {
            return res.status(400).send({
                success: false,
                message: "Book not found!"
            })
        }
        res.status(200).send({
            success: true,
            message: "These books found",
            bookFound: bookSearchData,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error",
            error: error.message,
        });
    }
}

const searchBookByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params
        const isCategoryExist = await categoryModel.findOne({
            categoryName: categoryName
        })
        if (!isCategoryExist) {
            return res.status(401).send({
                success: false,
                message: "Category not exist in database",
            })
        }
        const bookSearchData = await bookModel.find({
            bookCategory: categoryName
        }).select('bookName bookImage');
        res.status(200).send({
            success: true,
            message: "Book search data found!",
            bookData: bookSearchData,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error",
            error: error.message,
        });
    }
}

const bookDetails = async (req, res) => {
    try {
        const { bookId } = req.params
        const bookData = await bookModel.findById(bookId)
        const bookSelectedData = await bookModel.findById(bookId).select('bookName bookDescription bookAuthor bookCategory bookCost')
        if (bookData) {
            let isAvailable = "Available"
            if (bookData.bookStatus != "Available") {
                isAvailable = "not available"
            }
            const reviewData = await reviewModel.find({
                bookId: bookId
            }).select('rating')
            const totalRating = reviewData.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviewData.length;
            res.status(200).send({
                success: true,
                message: "Book details found",
                isAvailable: isAvailable,
                bookData: bookSelectedData,
                averageRating: averageRating,
            })
        } else {
            res.status(401).send({
                success: false,
                message: "Book not found!"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error",
            error: error.message,
        });
    }
}

const borrowBooks = async (req, res) => {
    try {
        const { userId, bookId } = req.params
        const userData = await userModel.findById(userId)
        const bookData = await bookModel.findById(bookId)
        if (userData && bookData) {
            if (userData.borrowBooks.length >= 2) {
                return res.status(401).send({
                    success: false,
                    message: "You already owned 2 books,First return!"
                })
            }
            if (bookData.bookStatus != "available") {
                return res.status(401).send({
                    success: false,
                    message: "This book is already by someone"
                })
            }
            bookData.currentOwner = userId
            bookData.bookStatus = "not available"
            userData.borrowBooks.push(bookData.bookName)
            await bookData.save();
            await userData.save();
            res.status(200).send({
                success: true,
                message: "You can take your book from nearest our Library",
            })
        } else {
            res.status(400).send({
                success: false,
                message: "User or Book data not found!"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

const returnBook = async (req, res) => {
    try {
        const { userId, bookId } = req.params
        const userData = await userModel.findById(userId)
        const bookData = await bookModel.findById(bookId)
        if (userData && bookData) {
            if (userData.borrowBooks.includes(bookData.bookName)) {
                const bookNameIndex = userData.borrowBooks.indexOf(bookData.bookName)
                userData.borrowBooks.splice(bookNameIndex, 1)
                bookData.status = "available"
                bookData.currentOwner = null
                await bookData.save()
                await userData.save()
                res.status(200).send({
                    success: true,
                    message: "Thanks for returning book!"
                })
            } else {
                res.status(400).send({
                    success: false,
                    message: "You not owned book!"
                })
            }
        } else {
            res.status(401).send({
                success: false,
                message: "User or Book data not found!"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

const likeDislikeBook = async (req, res) => {
    try {
        const { userId, bookId } = req.params
        const userData = await userModel.findById(userId)
        const bookData = await bookModel.findById(bookId)
        if (userData && bookData) {
            if (!bookData.likeByUsers.includes(userId)) {
                console.log('hhh')
                bookData.likeByUsers.push(userId)
                bookData.bookLikes = bookData.bookLikes + 1
                res.status(200).send({
                    success: true,
                    message: "Thanks for giving review (Like)"
                })
            } else {
                const userIdIndex = bookData.likeByUsers.indexOf(userId)
                bookData.likeByUsers.splice(userIdIndex, 1)
                bookData.bookLikes = bookData.bookLikes - 1
                res.status(200).send({
                    success: true,
                    message: "Thanks for giving review (Dislike)"
                })
            }
            bookData.save()
        } else {
            res.status(401).send({
                success: false,
                message: "User or Book data not found!"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

module.exports = {
    addBook,
    editBook,
    deleteBook,
    searchBookByName,
    searchBookByCategory,
    bookDetails,
    borrowBooks,
    returnBook,
    likeDislikeBook,
}