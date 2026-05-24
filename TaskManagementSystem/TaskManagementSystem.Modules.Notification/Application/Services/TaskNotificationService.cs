using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;

namespace TaskManagementSystem.Modules.Notification.Application.Services;

public class TaskNotificationService : ITaskNotificationService
{
    private readonly INotificationService notificationService;

    public TaskNotificationService(
        INotificationService notificationService)
    {
        this.notificationService = notificationService;
    }

    public async Task NotifyTaskAssignedAsync(
        TaskItem task,
        IEnumerable<int> assignedUserIds,
        string managerName)
    {
        foreach (var memberId in assignedUserIds)
        {
            await notificationService.SendNotificationAsync(
                memberId,
                $"You were assigned to task: {task.Title}");
        }

        var adminId =
            await notificationService.GetAdminIdAsync();

        await notificationService.SendNotificationAsync(
            adminId,
            $"Task: {task.Title} was created by {managerName}");
    }

    public async Task NotifyTaskArchivedAsync(
        TaskItem task,
        int userid)
    {
        foreach (var memberId in task.Assignments)
        {
            await notificationService.SendNotificationAsync(
                memberId.UserId,
                $"Task: {task.Title} was deleted");
        }

        await notificationService.SendNotificationAsync(
            userid,
            $"Task: {task.Title} was deleted");

        var adminId =
            await notificationService.GetAdminIdAsync();

        await notificationService.SendNotificationAsync(
            adminId,
            $"Task: {task.Title} was archived");
    }

    public async Task NotifyTaskTransferedAsync(
        TaskItem task,
        IEnumerable<int> oldAssignedUsers)
    {
        foreach (var userId in oldAssignedUsers)
        {
            await notificationService.SendNotificationAsync(
                userId,
                $"You were unassigned from task: {task.Title}");
        }
    }

    public async Task NotifyTaskRecoverAsync(TaskItem task)
    {
        await notificationService.SendNotificationAsync(
            task.Team.ManagerId,
            $"Your task: {task.Title} was recovered");
    }

    public async Task NotifyTaskEditAsync(
        TaskItem task,
        IEnumerable<int> removedUsers,
        IEnumerable<int> addedUsers)
    {
        foreach (var userId in removedUsers)
        {
            await notificationService.SendNotificationAsync(
                userId,
                $"You were unassigned from task: {task.Title}");
        }

        foreach (var userId in addedUsers)
        {
            await notificationService.SendNotificationAsync(
                userId,
                $"You were assigned to task: {task.Title}");
        }
    }
}
