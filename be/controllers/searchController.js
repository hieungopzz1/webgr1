const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Blog = require("../models/Blog");

const searchBlogs = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i");
    const fuzzyRegex = new RegExp(query.split('').join('.*'), 'i');
    
    const directBlogMatches = await Blog.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
    .populate('student_id', 'firstName lastName student_ID avatar')
    .populate('tutor_id', 'firstName lastName tutor_ID avatar')
    .sort({ updatedAt: -1 });
    
    const studentMatches = await Student.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { student_ID: searchRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: searchRegex
            }
          }
        }
      ]
    }).select('_id');
    
    const studentBlogMatches = await Blog.find({
      student_id: { $in: studentMatches.map(student => student._id) }
    })
    .populate('student_id', 'firstName lastName student_ID avatar')
    .populate('tutor_id', 'firstName lastName tutor_ID avatar')
    .sort({ updatedAt: -1 });
    
    const tutorMatches = await Tutor.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { tutor_ID: searchRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: searchRegex
            }
          }
        }
      ]
    }).select('_id');
    
    const tutorBlogMatches = await Blog.find({
      tutor_id: { $in: tutorMatches.map(tutor => tutor._id) }
    })
    .populate('student_id', 'firstName lastName student_ID avatar')
    .populate('tutor_id', 'firstName lastName tutor_ID avatar')
    .sort({ updatedAt: -1 });
    
    let exactMatches = [...directBlogMatches];
    
    studentBlogMatches.forEach(blog => {
      if (!exactMatches.some(existing => existing._id.toString() === blog._id.toString())) {
        exactMatches.push(blog);
      }
    });
    
    tutorBlogMatches.forEach(blog => {
      if (!exactMatches.some(existing => existing._id.toString() === blog._id.toString())) {
        exactMatches.push(blog);
      }
    });
    
    let fuzzyMatches = [];
    
    if (exactMatches.length < 3) {
      const fuzzyBlogMatches = await Blog.find({
        $or: [
          { title: fuzzyRegex },
          { content: fuzzyRegex }
        ]
      })
      .populate('student_id', 'firstName lastName student_ID avatar')
      .populate('tutor_id', 'firstName lastName tutor_ID avatar')
      .sort({ updatedAt: -1 });
      
      const fuzzyStudentMatches = await Student.find({
        $or: [
          { firstName: fuzzyRegex },
          { lastName: fuzzyRegex },
          { student_ID: fuzzyRegex }
        ]
      }).select('_id');
      
      const fuzzyStudentBlogMatches = await Blog.find({
        student_id: { $in: fuzzyStudentMatches.map(student => student._id) }
      })
      .populate('student_id', 'firstName lastName student_ID avatar')
      .populate('tutor_id', 'firstName lastName tutor_ID avatar')
      .sort({ updatedAt: -1 });
      
      const fuzzyTutorMatches = await Tutor.find({
        $or: [
          { firstName: fuzzyRegex },
          { lastName: fuzzyRegex },
          { tutor_ID: fuzzyRegex }
        ]
      }).select('_id');
      
      const fuzzyTutorBlogMatches = await Blog.find({
        tutor_id: { $in: fuzzyTutorMatches.map(tutor => tutor._id) }
      })
      .populate('student_id', 'firstName lastName student_ID avatar')
      .populate('tutor_id', 'firstName lastName tutor_ID avatar')
      .sort({ updatedAt: -1 });
      
      fuzzyMatches = [...fuzzyBlogMatches];
      
      fuzzyStudentBlogMatches.forEach(blog => {
        if (!fuzzyMatches.some(existing => existing._id.toString() === blog._id.toString())) {
          fuzzyMatches.push(blog);
        }
      });
      
      fuzzyTutorBlogMatches.forEach(blog => {
        if (!fuzzyMatches.some(existing => existing._id.toString() === blog._id.toString())) {
          fuzzyMatches.push(blog);
        }
      });
      
      fuzzyMatches = fuzzyMatches.filter(fuzzyBlog => 
        !exactMatches.some(exactBlog => exactBlog._id.toString() === fuzzyBlog._id.toString())
      );
    }
    
    const allResults = [...exactMatches, ...fuzzyMatches];
    
    const formattedResults = allResults.map(blog => {
      const author = blog.student_id || blog.tutor_id;
      return {
        _id: blog._id,
        title: blog.title || 'Untitled',
        content: blog.content && blog.content.length > 150 
          ? blog.content.substring(0, 150) + '...' 
          : blog.content,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        author: author ? {
          _id: author._id,
          name: `${author.firstName} ${author.lastName}`,
          id: author.student_ID || author.tutor_ID || 'N/A',
          role: blog.student_id ? 'Student' : 'Tutor',
          avatar: author.avatar
        } : null,
        likes: blog.likes || 0,
        matchType: exactMatches.includes(blog) ? 'exact' : 'fuzzy'
      };
    });

    return res.status(200).json({
      message: "Search results for blogs",
      query,
      exactResultsCount: exactMatches.length,
      fuzzyResultsCount: fuzzyMatches.length,
      totalResults: formattedResults.length,
      results: formattedResults
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
  searchBlogs
};