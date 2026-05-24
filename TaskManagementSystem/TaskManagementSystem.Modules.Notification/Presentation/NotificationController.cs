using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace TaskManagementSystem.Modules.Notification.Presentation;

[ApiController]
[Route("api/Notification")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService notificationService;
    public NotificationController(NotificationService notificationService) { 
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
    public async Task<ActionResult> MarkAsReadAll(int notificationId)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var (result, error) = await notificationService.MarkAsReadAllAsync(userid);
        if (error != null) return BadRequest(error);
        return Ok(result);
    }
}
