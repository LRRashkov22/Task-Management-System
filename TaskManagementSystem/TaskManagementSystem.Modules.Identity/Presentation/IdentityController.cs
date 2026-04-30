using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace TaskManagementSystem.Modules.Identity.Presentation;

[ApiController]
[Route("api/identity")]
public class IdentityController : ControllerBase
{
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok("Identity module works");
    }
}