class JobFitService {
    static async analyzeJobFit(formData, user) {
        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('jobDescription', formData.jobDescription);
            formDataToSend.append('resumeFile', formData.resumeFile);

            const headers = {};
            if (user) {
                headers['x-user-id'] = user.uid;
                headers['x-user-email'] = user.email;
            }

            const response = await fetch('/api/job-fit/analyze', {
                method: 'POST',
                headers,
                body: formDataToSend
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Job fit analysis error:', error);
            return {
                success: false,
                error: 'Network error. Please check your connection and try again.'
            };
        }
    }

    static validateFile(file) {
        const errors = [];
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        const allowedExtensions = ['.docx', '.doc'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!file) {
            errors.push('Please upload a resume file');
            return errors;
        }

        if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
            errors.push('Please upload a DOCX or DOC file');
        }

        if (file.size > maxSize) {
            errors.push('File size must be less than 5MB');
        }

        return errors;
    }

    static validateInputs(formData) {
        const errors = [];

        if (!formData.jobDescription || formData.jobDescription.trim().length < 50) {
            errors.push('Job description must be at least 50 characters long. Please provide more details about the position.');
        }

        if (formData.jobDescription && formData.jobDescription.length > 50000) {
            errors.push('Job description cannot exceed 50,000 characters. Please provide a more concise version.');
        }

        if (!formData.resumeFile) {
            errors.push('Please upload a resume file');
        } else {
            const fileErrors = this.validateFile(formData.resumeFile);
            errors.push(...fileErrors);
        }

        return errors;
    }

    static getEstimatedProcessingTime(jobDescLength, resumeLength) {
        const totalLength = jobDescLength + resumeLength;
        if (totalLength < 1000) return '30-60 seconds';
        if (totalLength < 3000) return '1-2 minutes';
        return '2-3 minutes';
    }

    static formatFitScore(score) {
        if (score >= 80) return { label: 'Excellent Fit', color: '#10b981' };
        if (score >= 60) return { label: 'Good Fit', color: '#f59e0b' };
        if (score >= 40) return { label: 'Moderate Fit', color: '#f97316' };
        return { label: 'Poor Fit', color: '#ef4444' };
    }

    static async tailorCV(formData, user) {
        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('jobDescription', formData.jobDescription);
            formDataToSend.append('resumeFile', formData.resumeFile);
            formDataToSend.append('templateId', formData.templateId || '1');

            const headers = {};
            if (user) {
                headers['x-user-id'] = user.uid;
                headers['x-user-email'] = user.email;
            }

            const response = await fetch('/api/job-fit/tailor-cv', {
                method: 'POST',
                headers,
                body: formDataToSend
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('CV tailoring error:', error);
            return {
                success: false,
                error: 'Network error. Please check your connection and try again.'
            };
        }
    }
}

export { JobFitService };
