class TagUpdateResponse {

    constructor(reminderId, currentTags) {

        this.resourceId = reminderId;
        this.activeTags = currentTags;
        this.timestamp = new Date();
    }

    generate() {

        return {
            status: "success",
            message: "Los tags del recordatorio han sido actualizados.",
            data: {
                reminderId: this.resourceId,
                tags: this.activeTags,
                count: this.activeTags.length,
                updatedAt: this.timestamp
            }
        };
    }
}

module.exports = TagUpdateResponse;