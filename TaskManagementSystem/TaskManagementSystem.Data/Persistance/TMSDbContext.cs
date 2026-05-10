using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Data;

public class TaskManagementDbContext : DbContext
{
    public TaskManagementDbContext(DbContextOptions<TaskManagementDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMembership> TeamMemberships => Set<TeamMembership>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<CommentMention> CommentMentions => Set<CommentMention>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<TaskHistory> TaskHistories => Set<TaskHistory>();
    public DbSet<WorkSession> WorkSessions => Set<WorkSession>();
    public DbSet<Log> Logs => Set<Log>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            entity.HasKey(user => user.Id);

            entity.Property(user => user.Username)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(user => user.Username)
                .IsUnique();

            entity.Property(user => user.PasswordHash)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(user => user.Role)
                .HasConversion<string>()
                .HasMaxLength(30);

            entity.Property(user => user.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(user => user.RefreshToken)
                .HasMaxLength(512);

            entity.HasOne(user => user.Manager)
                .WithMany(manager => manager.ManagedUsers)
                .HasForeignKey(user => user.ManagerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.ToTable("Teams");

            entity.HasKey(team => team.Id);

            entity.Property(team => team.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(team => team.Name)
                .IsUnique();

            entity.HasOne(team => team.Manager)
                .WithMany(user => user.ManagedTeams)
                .HasForeignKey(team => team.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TeamMembership>(entity =>
        {
            entity.ToTable("TeamMemberships");

            entity.HasKey(membership => new
            {
                membership.TeamId,
                membership.UserId
            });

            entity.Property(membership => membership.JoinedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(membership => membership.IsActive)
                .HasDefaultValue(true);

            entity.HasOne(membership => membership.Team)
                .WithMany(team => team.Memberships)
                .HasForeignKey(membership => membership.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(membership => membership.User)
                .WithMany(user => user.TeamMemberships)
                .HasForeignKey(membership => membership.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("TaskItems");

            entity.HasKey(task => task.Id);

            entity.Property(task => task.Title)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(task => task.Description)
                .HasMaxLength(2000);

            entity.Property(task => task.Priority)
                .HasConversion<string>()
                .HasMaxLength(30);

            entity.Property(task => task.Status)
                .HasConversion<string>()
                .HasMaxLength(30);

            entity.Property(task => task.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(task => task.Team)
                .WithMany(team => team.Tasks)
                .HasForeignKey(task => task.TeamId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(task => task.CreatedBy)
                .WithMany(user => user.CreatedTasks)
                .HasForeignKey(task => task.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TaskAssignment>(entity =>
        {
            entity.ToTable("TaskAssignments");

            entity.HasKey(assignment => new
            {
                assignment.TaskId,
                assignment.UserId
            });

            entity.Property(assignment => assignment.AssignedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(assignment => assignment.TaskItem)
                .WithMany(task => task.Assignments)
                .HasForeignKey(assignment => assignment.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(assignment => assignment.User)
                .WithMany(user => user.TaskAssignments)
                .HasForeignKey(assignment => assignment.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.ToTable("Comments");

            entity.HasKey(comment => comment.Id);

            entity.Property(comment => comment.Content)
                .IsRequired()
                .HasMaxLength(2000);

            entity.Property(comment => comment.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(comment => comment.User)
                .WithMany(user => user.Comments)
                .HasForeignKey(comment => comment.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(comment => comment.TaskItem)
                .WithMany(task => task.Comments)
                .HasForeignKey(comment => comment.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CommentMention>(entity =>
        {
            entity.ToTable("CommentMentions");

            entity.HasKey(mention => mention.Id);

            entity.HasIndex(mention => new
            {
                mention.CommentId,
                mention.MentionedUserId
            }).IsUnique();

            entity.HasOne(mention => mention.Comment)
                .WithMany(comment => comment.Mentions)
                .HasForeignKey(mention => mention.CommentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(mention => mention.MentionedUser)
                .WithMany(user => user.CommentMentions)
                .HasForeignKey(mention => mention.MentionedUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");

            entity.HasKey(notification => notification.Id);

            entity.Property(notification => notification.Message)
                .IsRequired()
                .HasMaxLength(1000);

            entity.Property(notification => notification.Type)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.Property(notification => notification.IsRead)
                .HasDefaultValue(false);

            entity.Property(notification => notification.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(notification => notification.User)
                .WithMany(user => user.Notifications)
                .HasForeignKey(notification => notification.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TaskHistory>(entity =>
        {
            entity.ToTable("TaskHistories");

            entity.HasKey(history => history.Id);

            entity.Property(history => history.Action)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(history => history.OldValue)
                .HasMaxLength(1000);

            entity.Property(history => history.NewValue)
                .HasMaxLength(1000);

            entity.Property(history => history.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(history => history.TaskItem)
                .WithMany(task => task.History)
                .HasForeignKey(history => history.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(history => history.ChangedBy)
                .WithMany(user => user.TaskHistories)
                .HasForeignKey(history => history.ChangedById)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WorkSession>(entity =>
        {
            entity.ToTable("WorkSessions");

            entity.HasKey(session => session.Id);

            entity.Property(session => session.Date)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(session => session.TaskItem)
                .WithMany(task => task.WorkSessions)
                .HasForeignKey(session => session.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(session => session.User)
                .WithMany(user => user.WorkSessions)
                .HasForeignKey(session => session.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Log>(entity =>
        {
            entity.ToTable("Logs");

            entity.HasKey(log => log.Id);

            entity.Property(log => log.Action)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(log => log.Data)
                .HasMaxLength(4000);

            entity.Property(log => log.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(log => log.User)
                .WithMany(user => user.Logs)
                .HasForeignKey(log => log.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
