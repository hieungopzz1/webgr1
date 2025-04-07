const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Blog = require("../models/Blog");

/**
 * Tìm kiếm người dùng và blog theo từ khóa
 * Hỗ trợ tìm kiếm theo: tên, email, nội dung blog
 */
const search = async (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Tạo regular expression cho tìm kiếm không phân biệt hoa thường và một phần của chuỗi
    const searchRegex = new RegExp(query, "i");
    
    // Kết quả tìm kiếm
    let results = {
      users: [],
      blogs: []
    };

    // Tìm kiếm người dùng nếu type là 'all' hoặc 'users'
    if (!type || type === 'all' || type === 'users') {
      // Tìm kiếm trong Student
      const students = await Student.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          // Tìm kiếm kết hợp firstName + lastName
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchRegex
              }
            }
          },
          // Tìm kiếm kết hợp lastName + firstName
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$lastName", " ", "$firstName"] },
                regex: searchRegex
              }
            }
          }
        ]
      }).select('_id firstName lastName email avatar role');

      // Tìm kiếm trong Tutor
      const tutors = await Tutor.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          // Tìm kiếm kết hợp firstName + lastName
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchRegex
              }
            }
          },
          // Tìm kiếm kết hợp lastName + firstName
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$lastName", " ", "$firstName"] },
                regex: searchRegex
              }
            }
          }
        ]
      }).select('_id firstName lastName email avatar role');

      results.users = [...students, ...tutors];
    }

    // Tìm kiếm blog nếu type là 'all' hoặc 'blogs'
    if (!type || type === 'all' || type === 'blogs') {
      const blogs = await Blog.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      })
        .populate('author', 'firstName lastName avatar')
        .select('_id title content createdAt');

      results.blogs = blogs.map(blog => ({
        _id: blog._id,
        title: blog.title,
        content: blog.content && blog.content.length > 150 
          ? blog.content.substring(0, 150) + '...' 
          : blog.content,
        createdAt: blog.createdAt,
        author: blog.author
      }));
    }

    // Thêm tính năng tìm kiếm tương tự (fuzzy search) cho tên người dùng
    if (!type || type === 'all' || type === 'users') {
      // Thực hiện fuzzy search bằng cách tìm tương tự
      if (results.users.length === 0) {
        // Tìm kiếm với độ tương tự thấp hơn
        const fuzzyRegex = new RegExp(query.split('').join('.*'), 'i');
        
        const fuzzyStudents = await Student.find({
          $or: [
            { firstName: fuzzyRegex },
            { lastName: fuzzyRegex }
          ]
        }).select('_id firstName lastName email avatar role');

        const fuzzyTutors = await Tutor.find({
          $or: [
            { firstName: fuzzyRegex },
            { lastName: fuzzyRegex }
          ]
        }).select('_id firstName lastName email avatar role');

        if (fuzzyStudents.length > 0 || fuzzyTutors.length > 0) {
          results.fuzzyUsers = [...fuzzyStudents, ...fuzzyTutors];
        }
      }
    }

    return res.status(200).json({
      message: "Search results",
      query,
      results
    });

  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ 
      message: "Error occurred while searching", 
      error: error.message 
    });
  }
};

/**
 * Tìm kiếm người dùng theo vai trò và từ khóa
 */
const searchUsers = async (req, res) => {
  try {
    const { query, role } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i");
    let results = [];

    // Filter theo role nếu được cung cấp
    if (role === 'student') {
      results = await Student.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchRegex
              }
            }
          },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$lastName", " ", "$firstName"] },
                regex: searchRegex
              }
            }
          }
        ]
      }).select('_id firstName lastName email avatar role student_ID major');
    } 
    else if (role === 'tutor') {
      results = await Tutor.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchRegex
              }
            }
          },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$lastName", " ", "$firstName"] },
                regex: searchRegex
              }
            }
          }
        ]
      }).select('_id firstName lastName email avatar role');
    }
    else {
      // Tìm cả hai loại nếu không chỉ định role
      const students = await Student.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchRegex
              }
            }
          },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$lastName", " ", "$firstName"] },
                regex: searchRegex
              }
            }
          }
        ]
      }).select('_id firstName lastName email avatar role student_ID major');

      const tutors = await Tutor.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchRegex
              }
            }
          },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$lastName", " ", "$firstName"] },
                regex: searchRegex
              }
            }
          }
        ]
      }).select('_id firstName lastName email avatar role');

      results = [...students, ...tutors];
    }

    // Thêm fuzzy search nếu không tìm thấy kết quả nào
    if (results.length === 0) {
      const fuzzyRegex = new RegExp(query.split('').join('.*'), 'i');
      
      let fuzzyResults = [];
      
      if (role === 'student' || !role) {
        const fuzzyStudents = await Student.find({
          $or: [
            { firstName: fuzzyRegex },
            { lastName: fuzzyRegex }
          ]
        }).select('_id firstName lastName email avatar role student_ID major');
        fuzzyResults.push(...fuzzyStudents);
      }
      
      if (role === 'tutor' || !role) {
        const fuzzyTutors = await Tutor.find({
          $or: [
            { firstName: fuzzyRegex },
            { lastName: fuzzyRegex }
          ]
        }).select('_id firstName lastName email avatar role');
        fuzzyResults.push(...fuzzyTutors);
      }
      
      if (fuzzyResults.length > 0) {
        return res.status(200).json({
          message: "Fuzzy search results",
          query,
          fuzzyResults,
          exact: false
        });
      }
    }

    return res.status(200).json({
      message: "Search results",
      query,
      results,
      exact: true
    });

  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({ 
      message: "Error occurred while searching users", 
      error: error.message 
    });
  }
};

/**
 * Tìm kiếm blog theo nội dung hoặc tiêu đề
 */
const searchBlogs = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i");
    
    const blogs = await Blog.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
      .populate('author', 'firstName lastName avatar')
      .select('_id title content createdAt likes');

    const results = blogs.map(blog => ({
      _id: blog._id,
      title: blog.title,
      content: blog.content && blog.content.length > 150 
        ? blog.content.substring(0, 150) + '...' 
        : blog.content,
      createdAt: blog.createdAt,
      author: blog.author,
      likes: blog.likes || 0
    }));

    return res.status(200).json({
      message: "Search results for blogs",
      query,
      results
    });

  } catch (error) {
    console.error("Search blogs error:", error);
    return res.status(500).json({ 
      message: "Error occurred while searching blogs", 
      error: error.message 
    });
  }
};

module.exports = {
  search,
  searchUsers,
  searchBlogs
}; 