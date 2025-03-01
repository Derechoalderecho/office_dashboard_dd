"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronRight } from "lucide-react"
import { Button } from "@heroui/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

import PersonalInfoStep from "./steps/personal-info-step"
import ContactInfoStep from "./steps/contact-info-step"
import ProfessionalInfoStep from "./steps/professional-info-step"
import ReviewStep from "./steps/review-step"
import { submitFormData } from "@/actions/citizenActions"


export default function StepperForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    occupation: "",
    education: "",
    department: "",
    position: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const steps = [
    { title: "Personal Info", component: PersonalInfoStep },
    { title: "Location", component: ContactInfoStep },
    { title: "Professional", component: ProfessionalInfoStep },
    { title: "Review", component: ReviewStep },
  ]

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentStep === steps.length - 1) {
      setIsSubmitting(true)

      // Create FormData object
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value.toString())
      })

      try {
        // Submit the form data
        await submitFormData(formDataObj)
        setIsComplete(true)
      } catch (error) {
        console.error("Error submitting form:", error)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      handleNext()
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>Complete all steps to submit your application</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stepper Header */}
          <div className="mb-8">
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      index < currentStep
                        ? "bg-primary border-primary text-primary-foreground"
                        : index === currentStep
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      index <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-1 bg-primary transition-all duration-300"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form Content */}
          {isComplete ? (
            <div className="text-center py-10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground">Thank you for completing all steps. We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CurrentStepComponent formData={formData} updateFormData={updateFormData} />
            </form>
          )}
        </CardContent>
        {!isComplete && (
          <CardFooter className="flex justify-between">
            <Button type="button" variant="bordered" onPress={handlePrevious} disabled={currentStep === 0}>
              Previous
            </Button>
            <Button type="submit" onPress={handleSubmit} disabled={isSubmitting} className="flex items-center">
              {isSubmitting ? "Submitting..." : currentStep === steps.length - 1 ? "Submit" : "Next"}
              {!isSubmitting && currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

