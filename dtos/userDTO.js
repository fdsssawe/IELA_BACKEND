export default class UserDto {
    email;
    id;
    isActicated;


    constructor(model) {
        this.email = model.email
        this.id = model._id
        this.postsSaved = model.postsSaved
        this.isActicated = model.isActicated
    }
}