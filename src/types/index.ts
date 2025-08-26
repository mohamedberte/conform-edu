export interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
  }
  
  export interface StudentRecord {
    id: string;
    name: string;
    grade: number;
    teacherId: string;
    parentId: string;
  }
  
  export interface TeacherAssignment {
    id: string;
    teacherId: string;
    studentId: string;
    subject: string;
  }
  
  export interface GradeEntry {
    studentId: string;
    subject: string;
    grade: number;
    term: string;
  }
  
  export interface Report {
    studentId: string;
    term: string;
    grades: GradeEntry[];
    comments: string;
  }
  
  export interface ParentPortal {
    parentId: string;
    studentRecords: StudentRecord[];
    messages: string[];
  }