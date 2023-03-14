interface PageInfo {
    hasNextPage: boolean,
    endCursor: string
}

interface QueryPage<T> {
    totalCount: number,
    pageInfo: PageInfo,
    nodes: T[]
}

interface Class {
    id: number,
    term: number,
    courseReferenceNumber: number,
    courseNumber: string,
    campusDescription: string,
    courseTitle: string,
    creditHours: number,
    maximumEnrollment: number,
    enrollment: number,
    seatsAvailable: number,
    waitCapacity?: number,
    waitAvailable?: number,
    linkedSections: LinkedSection[],
    meetings: Meeting[]
    faculty: Faculty[]
}

interface LinkedSection {
    childNavigation?: Class,
    parentNavigation?: Class
}

interface Meeting {
    id: number,
    classId: number,
    beginTime?: string,
    endTime?: string,
    beginDate?: string,
    endDate?: string,
    building?: string,
    buildingDescription?: string,
    campus?: string,
    campusDescription?: string,
    room?: string,
    creditHourSession: number,
    hoursPerWeek: number,
    inSession: number
    meetingType: number
}

interface Faculty {
    class?: Class,
    professor?: Professor
}

interface Professor {
    email: string,
    rmpId?: string,
    lastName: string,
    firstName: string,
    department?: string
    numRatings: number,
    rating: number,
    difficulty: number,
    wouldTakeAgainPercent: number,
    fullName: string,
    classes?: Faculty[]
}

export type { PageInfo, QueryPage, Class, LinkedSection, Meeting, Faculty }