const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AssignStudent = require('../models/AssignStudent');
const Notification = require('../models/Notification');

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const userId = req.body.userId;
    const classId = req.body.classId;
    const documentType = req.body.documentType;

    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    if (!documentType || !['assignment', 'submission'].includes(documentType)) {
      return res.status(400).json({ message: 'Valid document type (assignment or submission) is required' });
    }

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    let tutor_id = null;
    let student_id = null;

    // Check if the uploader is a Tutor or Student
    const tutor = await Tutor.findById(userId);
    const student = await Student.findById(userId);

    if (tutor) {
      tutor_id = userId;
      
      // Verify tutor is assigned to this class
      if (classExists.tutor.toString() !== tutor_id.toString()) {
        return res.status(403).json({ message: 'Tutor is not assigned to this class' });
      }
      
      // Only tutors can upload assignments
      if (documentType === 'submission') {
        return res.status(403).json({ message: 'Tutors can only upload assignments, not submissions' });
      }
    } else if (student) {
      student_id = userId;
      
      // Verify student is in this class
      const isAssigned = await AssignStudent.findOne({
        student: student_id,
        class: classId
      });
      
      if (!isAssigned) {
        return res.status(403).json({ message: 'Student is not assigned to this class' });
      }
      
      // Only students can upload submissions
      if (documentType === 'assignment') {
        return res.status(403).json({ message: 'Students can only upload submissions, not assignments' });
      }
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save document information to MongoDB
    const newDocument = new Document({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fileUrl: fileUrl,
      class_id: classId,
      tutor_id: tutor_id,
      student_id: student_id,
      document_type: documentType
    });

    await newDocument.save();

    // Send notification based on document type
    if (documentType === 'assignment' && tutor_id) {
      // Assignment uploaded by tutor - notify all students in this class
      const studentsInClass = await AssignStudent.find({ class: classId });
      const studentIds = studentsInClass.map(record => record.student.toString());
      
      if (studentIds.length > 0) {
        const notification = new Notification({
          title: "New Assignment Uploaded",
          content: `A new assignment has been uploaded to ${classExists.class_name} by your tutor.`,
          senderId: tutor_id,
          recipientIds: studentIds
        });
        
        await notification.save();
      }
    } else if (documentType === 'submission' && student_id) {
      // Submission uploaded by student - notify the tutor
      if (classExists.tutor) {
        const studentInfo = await Student.findById(student_id);
        const studentName = studentInfo ? 
          `${studentInfo.firstName} ${studentInfo.lastName}` : 
          'A student';
          
        const notification = new Notification({
          title: "New Submission Received",
          content: `${studentName} has submitted an assignment for ${classExists.class_name}.`,
          senderId: student_id,
          recipientIds: [classExists.tutor.toString()]
        });
        
        await notification.save();
      }
    }

    res.status(200).json({
      message: 'Document uploaded successfully',
      file: req.file,
      fileUrl: fileUrl,
      class_id: classId,
      tutor_id: tutor_id,
      student_id: student_id,
      document_type: documentType
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading document', error: err });
  }
};

// Get all documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('class_id', 'class_name subject')
      .populate('tutor_id', 'firstName lastName')
      .populate('student_id', 'firstName lastName');
    res.status(200).json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching documents', error: err });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('class_id', 'class_name subject')
      .populate('tutor_id', 'firstName lastName')
      .populate('student_id', 'firstName lastName');
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching document', error: err });
  }
};

// Get documents by class
exports.getDocumentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const documents = await Document.find({ class_id: classId })
      .populate('class_id', 'class_name subject')
      .populate('tutor_id', 'firstName lastName')
      .populate('student_id', 'firstName lastName');
      
    res.status(200).json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching documents', error: err });
  }
};

// Get assignments (tutor uploads) for a specific class
exports.getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const assignments = await Document.find({ 
      class_id: classId,
      document_type: 'assignment'
    })
      .populate('class_id', 'class_name subject')
      .populate('tutor_id', 'firstName lastName');
      
    res.status(200).json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching assignments', error: err });
  }
};

// Get submissions (student uploads) for a specific class
exports.getClassSubmissions = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const submissions = await Document.find({ 
      class_id: classId,
      document_type: 'submission'
    })
      .populate('class_id', 'class_name subject')
      .populate('student_id', 'firstName lastName student_ID');
      
    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching submissions', error: err });
  }
};

// Get tutor's classes with documents (for tutor dashboard)
exports.getTutorClassesWithDocuments = async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    // Find classes where tutor is assigned
    const classes = await Class.find({ tutor: tutorId });
    
    if (classes.length === 0) {
      return res.status(200).json({ classes: [] });
    }
    
    const classIds = classes.map(c => c._id);
    
    // Find documents for these classes
    const documents = await Document.find({ class_id: { $in: classIds } })
      .populate('class_id', 'class_name subject')
      .populate('student_id', 'firstName lastName student_ID');
    
    // Group documents by class
    const result = classes.map(cls => {
      const classDocuments = documents.filter(doc => 
        doc.class_id && doc.class_id._id.toString() === cls._id.toString()
      );
      
      return {
        class: cls,
        assignments: classDocuments.filter(doc => doc.document_type === 'assignment'),
        submissions: classDocuments.filter(doc => doc.document_type === 'submission')
      };
    });
    
    res.status(200).json({ classes: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching tutor classes', error: err });
  }
};

// Get student's classes with documents (for student dashboard)
exports.getStudentClassesWithDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`Getting classes for student ID: ${studentId}`);
    
    // Validate student ID format
    if (!studentId || studentId.length < 12) {
      console.error(`Invalid student ID format: ${studentId}`);
      return res.status(400).json({ 
        message: 'Invalid student ID format',
        studentId: studentId
      });
    }
    
    // Find classes where student is assigned
    console.log(`Finding assignments for student: ${studentId}`);
    const assignments = await AssignStudent.find({ student: studentId })
      .populate('class');
    
    console.log(`Found ${assignments.length} class assignments for student`);
    
    if (assignments.length === 0) {
      return res.status(200).json({ 
        classes: [],
        message: 'No classes found for this student'
      });
    }
    
    // Filter out assignments with null class (in case of corrupted data)
    const validAssignments = assignments.filter(a => a.class);
    console.log(`Found ${validAssignments.length} valid assignments with class data`);
    
    if (validAssignments.length === 0) {
      return res.status(200).json({ 
        classes: [],
        message: 'No valid class data found for this student' 
      });
    }
    
    const classes = validAssignments.map(a => a.class);
    const classIds = classes.map(c => c._id);
    
    console.log(`Found these class IDs: ${classIds.join(', ')}`);
    
    // Find documents for these classes
    const documents = await Document.find({ class_id: { $in: classIds } })
      .populate('class_id', 'class_name subject')
      .populate('tutor_id', 'firstName lastName');
    
    console.log(`Found ${documents.length} documents for these classes`);
    
    // Group documents by class
    const result = classes.map(cls => {
      // Ensure class has valid _id
      if (!cls || !cls._id) {
        console.log('Skipping class with invalid ID');
        return null;
      }
      
      const clsId = cls._id.toString();
      console.log(`Processing class: ${clsId}, ${cls.class_name || 'Unknown'}`);
      
      const classDocuments = documents.filter(doc => 
        doc.class_id && doc.class_id._id && doc.class_id._id.toString() === clsId
      );
      
      console.log(`Found ${classDocuments.length} documents for class ${clsId}`);
      
      return {
        class: cls,
        assignments: classDocuments.filter(doc => doc.document_type === 'assignment'),
        studentSubmissions: classDocuments.filter(doc => 
          doc.document_type === 'submission' && 
          doc.student_id && doc.student_id.toString() === studentId
        )
      };
    }).filter(Boolean); // Remove null results
    
    console.log(`Returning ${result.length} classes with documents`);
    res.status(200).json({ classes: result });
  } catch (err) {
    console.error('Error in getStudentClassesWithDocuments:', err);
    res.status(500).json({ 
      message: 'Error fetching student classes', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if the user has permission to update this document
    const userId = req.body.userId;
    const userRole = req.body.userRole;
    
    if (userRole === 'Tutor' && document.tutor_id && document.tutor_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this document' });
    }
    
    if (userRole === 'Student' && document.student_id && document.student_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this document' });
    }

    // Delete old document from the file system
    const oldFilePath = path.join(__dirname, `../uploads/documents/${document.filename}`);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);  // Delete old file
    }

    // Update document info
    document.filename = req.file.filename;
    document.originalname = req.file.originalname;
    document.mimetype = req.file.mimetype;
    document.size = req.file.size;
    document.fileUrl = `/uploads/documents/${req.file.filename}`;

    await document.save();

    res.status(200).json({
      message: 'Document updated successfully',
      file: req.file,
      fileUrl: document.fileUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating document', error: err });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if the user has permission to delete this document
    const userId = req.body.userId;
    const userRole = req.body.userRole;
    
    if (userRole === 'Tutor' && document.tutor_id && document.tutor_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }
    
    if (userRole === 'Student' && document.student_id && document.student_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Delete document from the file system
    const filePath = path.join(__dirname, `../uploads/documents/${document.filename}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);  // Delete file
    }

    await Document.findByIdAndDelete(id);

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting document', error: err });
  }
};
