class CloseDetailsResponse {

   
    constructor(status, message, courseId) {
        this.status = status;
        this.message = message;
        this.closedResource = courseId;
        this.serverTimestamp = new Date();
    }

    generate() {
       
        return {
            "status": this.status,
            "message": this.message,
            "data": {
                "resourceId": this.closedResource,
                "processedAt": this.serverTimestamp
            }
        };
    }
}

module.exports = CloseDetailsResponse;