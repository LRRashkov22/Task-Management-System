namespace TaskManagementSystem.Data.Domain.Entities;

public class CommentMention
{
    public int Id { get; set; }

    public int CommentId { get; set; }

    public Comment Comment { get; set; } = null!;

    public int MentionedUserId { get; set; }

    public User MentionedUser { get; set; } = null!;
}
