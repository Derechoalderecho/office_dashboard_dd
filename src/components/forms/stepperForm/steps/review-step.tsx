type ReviewStepProps = {
  formData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    country: string
    city: string
    occupation: string
    education: string
    department: string
    position: string
  }
  updateFormData: (data: Partial<typeof formData>) => void
}

export default function ReviewStep({ formData }: ReviewStepProps) {
  const countryNames: Record<string, string> = {
    us: "United States",
    ca: "Canada",
    uk: "United Kingdom",
    au: "Australia",
    de: "Germany",
    fr: "France",
    jp: "Japan",
    other: "Other",
  }

  const educationLabels: Record<string, string> = {
    "high-school": "High School",
    associate: "Associate Degree",
    bachelor: "Bachelor's Degree",
    master: "Master's Degree",
    doctorate: "Doctorate",
    other: "Other",
  }

  const departmentLabels: Record<string, string> = {
    engineering: "Engineering",
    marketing: "Marketing",
    sales: "Sales",
    finance: "Finance",
    hr: "Human Resources",
    operations: "Operations",
    other: "Other",
  }

  const positionLabels: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior Level",
    manager: "Manager",
    director: "Director",
    executive: "Executive",
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Review Your Information</h2>
        <p className="text-sm text-muted-foreground">Please review your information before submitting.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">First Name:</span>
              <p>{formData.firstName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Name:</span>
              <p>{formData.lastName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p>{formData.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <p>{formData.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Location Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Country:</span>
              <p>{formData.country ? countryNames[formData.country] : "Not specified"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">City:</span>
              <p>{formData.city}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Occupation:</span>
              <p>{formData.occupation || "Not specified"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Education:</span>
              <p>{formData.education ? educationLabels[formData.education] : "Not specified"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Department:</span>
              <p>{formData.department ? departmentLabels[formData.department] : "Not specified"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Position Level:</span>
              <p>{formData.position ? positionLabels[formData.position] : "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-4">
        <p className="text-sm">
          By submitting this form, you agree to our Terms of Service and Privacy Policy. Please ensure all information
          is correct before proceeding.
        </p>
      </div>
    </div>
  )
}

