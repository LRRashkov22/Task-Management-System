using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Security.Claims;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Identity.Application.Interfaces;
using TaskManagementSystem.Modules.Identity.Application.UserDto_s;
using TaskManagementSystem.Modules.Identity.Infrastructure.Service;

namespace TaskManagementSystem.Modules.Identity.Presentation;

[ApiController]
[Route("api/identity")]
public class IdentityController : ControllerBase
{
    private readonly IAuthService AuthService;
    private readonly ICreateUser createUser;
    private readonly IManageUsers manageUsers;
    public IdentityController(IAuthService AuthService, ICreateUser createUser, IManageUsers manageUsers)
    {
        this.AuthService = AuthService;
        this.createUser = createUser;
        this.manageUsers = manageUsers;
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> login(UserDto request)
    {
        var (result, error) = await AuthService.LoginAsync(request);
        if (error != null) return BadRequest(error);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("Admin-only")]
    public IActionResult AdminOnlyEndpoint()
    {
        return Ok("You are Admin.");
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto requestDto)
    {
        var result = await AuthService.RefreshTokensAsync(requestDto);
        if (result is null) return Unauthorized("Invalid refresh token");
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("create-user")]
    public async Task<ActionResult> CreateUser(CreateUserDto request)
    {
        var (result, error) = await createUser.RegisterUser(request);
        if (error != null) return BadRequest(error);
        return NoContent();
    }
    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<TokenResponseDto>> ChangePassword(ChangePasswordDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var (result, error) = await AuthService.ChangePassword(request, userId);
        if (error != null) return BadRequest(error);
        return Ok(result);
    }
    [Authorize(Roles ="Admin")]
    [HttpPatch("edit-user")]
    public async Task<ActionResult<EditUserDto>> EditUser(EditUserDto request)
    {
       // var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await manageUsers.EditUser(request);
        if (result == null) return BadRequest("User not found or invalid input");
        return Ok(result);
    }
    [Authorize(Roles = "Admin")]
    [HttpDelete("delete-user")]
    public async Task<ActionResult> DeleteUser(GetUsersDto request)
    {
        var result = await manageUsers.DeleteUser(request);
        if (!result) return BadRequest("User not found");
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        await manageUsers.Logout(userId);
        return NoContent();
    }
}