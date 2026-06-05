using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;

namespace TaskManagementSystem.Modules.Notification.Presentation;

[ApiController]
[Route("api/Notification")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService notificationService;
    public NotificationController(INotificationService notificationService) { 
    this.notificationService = notificationService;
    }

    [Authorize]
    [HttpPatch("mark-as-read/{notificationId}")]
    public async Task<ActionResult> MarkAsRead(int notificationId) {
    var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
    var (result, error) = await notificationService.MarkAsReadAsync(userid, notificationId);
    if (error != null) return BadRequest(error);
    return Ok(result);
    }

    [Authorize]
    [HttpPatch("mark-as-read-all")]
    public async Task<ActionResult> MarkAsReadAll()
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var (result, error) = await notificationService.MarkAsReadAllAsync(userid);
        if (error != null) return BadRequest(error);
        return Ok(result);
    }
}
