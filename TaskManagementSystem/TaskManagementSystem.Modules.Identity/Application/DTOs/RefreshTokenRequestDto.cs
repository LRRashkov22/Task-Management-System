using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Identity.Application.DTOs
{
    public class RefreshTokenRequestDto
    {
        public Guid UserId { get; set; }
        public required string RefreshToken { get; set; }
    }
}
