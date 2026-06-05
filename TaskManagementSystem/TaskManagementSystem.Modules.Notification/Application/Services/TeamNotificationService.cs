using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;

namespace TaskManagementSystem.Modules.Notification.Application.Services;

public class TeamNotificationService : ITeamNotificationService
{
    private readonly INotificationService notificationService;

    public TeamNotificationService(
        INotificationService notificationService)
    {
        this.notificationService = notificationService;
    }

    public async Task NotifyCreateTeamAsync( Team team, IEnumerable<int> memberIds, string managerName)
    {
        foreach (var memberId in memberIds)
        {
            await notificationService.SendNotificationAsync(
                memberId,
                $"You were assigned to team: {team.Name}");
        }

        var adminId = await notificationService.GetAdminIdAsync();

        await notificationService.SendNotificationAsync(
            adminId,
            $"Team: {team.Name} was created by {managerName}");
    }

    public async Task NotifyTeamArchivedAsync(Team team)
    {
        foreach (var member in team.Memberships)
        {
            await notificationService.SendNotificationAsync(
                member.UserId,
                $"Team: {team.Name} was archived");
        }

        var adminId = await notificationService.GetAdminIdAsync();

        await notificationService.SendNotificationAsync(
            adminId,
            $"Team: {team.Name} was archived");
    }

    public async Task NotifyTeamRecoveredAsync(Team team)
    {
        await notificationService.SendNotificationAsync(
            team.ManagerId,
            $"Team: {team.Name} was recovered");
    }

    public async Task NotifyTeamTransferredAsync(Team team, int oldManagerId, int newManagerId)
    {
        await notificationService.SendNotificationAsync(
            oldManagerId,
            $"Team: {team.Name} was transferred");

        await notificationService.SendNotificationAsync(
            newManagerId,
            $"You received team: {team.Name}");
    }

    public async Task NotifyTeamEditedAsync(Team team, IEnumerable<int> removedUsers, IEnumerable<int> addedUsers)
    {
        foreach (var userId in removedUsers)
        {
            await notificationService.SendNotificationAsync(
                userId,
                $"You were removed from team: {team.Name}");
        }

        foreach (var userId in addedUsers)
        {
            await notificationService.SendNotificationAsync(
                userId,
                $"You were added to team: {team.Name}");
        }
    }
}
