const Schedule = require("../models/Schedule");
const Class = require("../models/Class");
const AssignStudent = require("../models/AssignStudent");
const Notification = require("../models/Notification");
const { createGoogleMeeting } = require("../services/googleMeet/meetingService");

// const createSchedule = async (req, res) => {
//   try {
//     const { classId, date, startTime, endTime, type, meetingLink } = req.body;

//     if (!classId || !date || !startTime || !endTime || !type) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (startTime === endTime) {
//       return res.status(400).json({ message: "Start time and end time cannot be the same" });
//     }

//     if (startTime > endTime) {
//       return res.status(400).json({ message: "Start time must be before end time" });
//     }

//     const classData = await Class.findById(classId);
//     if (!classData) {
//       return res.status(404).json({ message: "Class not found" });
//     }

//     if (type === "Online" && !meetingLink) {
//       return res.status(400).json({ message: "Online class must have a meeting link" });
//     }

//     const location = type === "Offline" ? classData.class_name : undefined;

//     const existingSchedule = await Schedule.findOne({
//       class: classId,
//       date: date,
//       $or: [
//         { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
//       ],
//     });

//     if (existingSchedule) {
//       return res.status(400).json({ message: "Schedule already exists for this time!" });
//     }

//     const assignedStudents = await AssignStudent.findOne({ class: classId });
//     if (!assignedStudents) {
//       return res.status(400).json({ message: "Assign student to this class." });
//     }

//     const newSchedule = new Schedule({
//       class: classId,
//       date,
//       startTime,
//       endTime,
//       type,
//       location,
//       meetingLink: type === "Online" ? meetingLink : undefined,
//     });

//     await newSchedule.save();

//     const io = req.app.get("socketio");
//     io.emit("updateDashboard", { message:" Add schedule successfully", newSchedule : newSchedule });

//     res.status(201).json({ message: "Schedule created successfully!", newSchedule });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const createSchedule = async (req, res) => {
  try {
    const { date, slots, classType } = req.body;
    const adminId = req.user.id;

    if (!date || !slots || slots.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let createdSchedules = [];
    const notifiedClasses = new Set();

    for (const slot of slots) {
      const { slot: slotNumber, classes } = slot;

      if (!slotNumber || !classes) {
        return res.status(400).json({ message: "Each slot must have a slot number and classes" });
      }

      const existingClasses = await Class.find({ _id: { $in: classes } });
      if (existingClasses.length !== classes.length) {
        return res.status(400).json({ message: "One or more classes not found" });
      }

      const studentsInClasses = await AssignStudent.find({ class: { $in: classes } });
      const classWithNoStudents = classes.filter(
        (classId) => !studentsInClasses.some((s) => s.class.toString() === classId)
      );

      if (classWithNoStudents.length > 0) {
        return res.status(400).json({
          message: "Some classes have no students assigned and cannot be scheduled",
          classWithNoStudents,
        });
      }

      const existingSchedule = await Schedule.find({ date, slot: slotNumber });
      const existingClassIds = existingSchedule.map((s) => s.class.toString());

      const classesAlreadyScheduled = classes.filter((classId) => existingClassIds.includes(classId));

      if (classesAlreadyScheduled.length > 0) {
        return res.status(400).json({
          message: "Some classes are already scheduled in this slot",
          classesAlreadyScheduled,
        });
      }

      const classesToAdd = classes.filter((classId) => !existingClassIds.includes(classId));
      for (const classId of classesToAdd) {
        const newSchedule = new Schedule({ 
          class: classId, 
          date, 
          slot: slotNumber,
          type: classType || "Offline" 
        });
        await newSchedule.save();
        createdSchedules.push(newSchedule);
        notifiedClasses.add(classId);
      }

      // const classesToRemove = existingClassIds.filter((classId) => !classes.includes(classId));
      // await Schedule.deleteMany({ date, slot: slotNumber, class: { $in: classesToRemove } });
    }

    // Send notifications
    if (notifiedClasses.size > 0) {
      // Get the date in readable format
      const dateObj = new Date(date);
      const formattedDate = dateObj.toDateString();
      
      // For each class, notify the assigned students and tutor
      for (const classId of notifiedClasses) {
        const classInfo = await Class.findById(classId);
        
        // Get students assigned to this class
        const assignedStudents = await AssignStudent.find({ class: classId });
        const studentIds = assignedStudents.map(assignment => assignment.student.toString());
        
        // Add tutor to recipients if available
        const recipientIds = [...studentIds];
        if (classInfo && classInfo.tutor) {
          recipientIds.push(classInfo.tutor.toString());
        }
        
        // Create notification
        if (recipientIds.length > 0) {
          const scheduleType = classType || "Offline";
          const notificationTitle = scheduleType === "Online" ? "New Online Class with Google Meet" : "New Class Schedule";
          const notificationContent = `A new ${scheduleType.toLowerCase()} class schedule has been created for ${classInfo.class_name || 'your class'} on ${formattedDate}`;
          
          if (scheduleType === "Online") {
            const notification = new Notification({
              title: notificationTitle,
              content: `${notificationContent}. You can access Google Meet when the class starts.`,
              senderId: adminId,
              recipientIds,
            });
            
            await notification.save();
          } else {
            const notification = new Notification({
              title: notificationTitle,
              content: notificationContent,
              senderId: adminId,
              recipientIds,
            });
            
            await notification.save();
          }
        }
      }
    }

    const updatedSchedules = await Schedule.find({ date });

    const io = req.app.get("socketio");
    io.emit("updateDashboard", { message: "Schedule updated successfully!",updatedSchedules });

    res.status(200).json({
      message: "Schedules updated successfully!",
      schedules: updatedSchedules,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate("class", "class_name");
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { date, startTime, endTime, type, meetingLink } = req.body;

    if (startTime === endTime) {
      return res
        .status(400)
        .json({ message: "Start time and end time cannot be the same" });
    }

    if (startTime > endTime) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time" });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { date, startTime, endTime, type, meetingLink },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const io = req.app.get("socketio");
    io.emit("updateDashboard", {
      message: " Update schedule successfully",
      updatedSchedule: updatedSchedule,
    });

    res
      .status(200)
      .json({ message: "Schedule updated successfully!", updatedSchedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const io = req.app.get("socketio");
    io.emit("updateDashboard", {
      message: " Delelte class successfully",
      deletedSchedule: deletedSchedule,
    });

    res.status(200).json({ message: "Schedule deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentSchedules = async (req, res) => {
  try {
    const studentId = req.user.id;

    const assignedClasses = await AssignStudent.find({
      student: studentId,
    }).distinct("class");

    const schedules = await Schedule.find({ class: { $in: assignedClasses } })
      .populate({
        path: "class",
        select: "class_name subject tutor",
        populate: {
          path: "tutor",
          select: "firstName lastName"
        }
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTutorSchedules = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const tutorClasses = await Class.find({ tutor: tutorId }).distinct("_id");

    const schedules = await Schedule.find({ class: { $in: tutorClasses } })
      .populate({
        path: "class",
        select: "class_name subject major"
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMeetLink = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const userId = req.user.id;
    
    const schedule = await Schedule.findById(scheduleId).populate("class", "class_name subject");
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    if (schedule.meetingLink) {
      return res.status(200).json({ 
        message: "Google Meet link already exists", 
        meetLink: schedule.meetingLink 
      });
    }
    
    const slotTimes = {
      1: { start: "07:00", end: "08:30" },
      2: { start: "08:45", end: "10:15" },
      3: { start: "10:30", end: "12:00" },
      4: { start: "13:00", end: "14:30" },
      5: { start: "14:45", end: "16:15" },
      6: { start: "16:30", end: "18:00" }
    };
    
    const dateObj = new Date(schedule.date);
    const dateStr = dateObj.toISOString().split('T')[0];
    const slotTime = slotTimes[schedule.slot];
    
    const startTime = new Date(`${dateStr}T${slotTime.start}:00+07:00`);
    const endTime = new Date(`${dateStr}T${slotTime.end}:00+07:00`);
    
    const meetingInfo = {
      summary: `Class: ${schedule.class.class_name}`,
      description: `Subject: ${schedule.class.subject || 'No information'}`,
      startTime,
      endTime
    };
    
    const meetLink = await createGoogleMeeting(meetingInfo);
    
    schedule.meetingLink = meetLink;
    await schedule.save();
    
    // Send notification about the Google Meet link only if this is not an online class
    // For online classes, the notification was already sent during schedule creation
    if (schedule.class && schedule.type !== "Online") {
      // Get students assigned to this class
      const assignedStudents = await AssignStudent.find({ class: schedule.class._id });
      const studentIds = assignedStudents.map(assignment => assignment.student.toString());
      
      // Get class information
      const classInfo = await Class.findById(schedule.class._id);
      
      // Add tutor to recipients if available
      const recipientIds = [...studentIds];
      if (classInfo && classInfo.tutor) {
        recipientIds.push(classInfo.tutor.toString());
      }
      
      // Create notification
      if (recipientIds.length > 0) {
        const formattedDate = dateObj.toDateString();
        const notification = new Notification({
          title: "Google Meet Link Created",
          content: `A Google Meet link has been created for ${schedule.class.class_name || 'your class'} on ${formattedDate}. Click on the schedule to join the meeting.`,
          senderId: userId,
          recipientIds,
        });
        
        await notification.save();
      }
    }
    
    const io = req.app.get("socketio");
    if (io) {
      io.emit("updateDashboard", { 
        message: "Google Meet link created",
        updatedSchedule: schedule
      });
    }
    
    res.status(200).json({ 
      message: "Google Meet link created successfully", 
      meetLink 
    });
    
  } catch (error) {
    console.error("Error creating Google Meet:", error);
    res.status(500).json({ 
      error: "Cannot create Google Meet",
      details: error.message 
    });
  }
};

module.exports = {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  getStudentSchedules,
  getTutorSchedules,
  createMeetLink
};
