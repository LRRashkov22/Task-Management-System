using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Modules.Logs.Application.Interfaces;
public interface IIdentityLogger
{
    Task UserCreatedLog(User user);
    Task UserEditedLog(User user);
    Task UserDeletedLog(User user);
    Task OwnershipTransferredLog(User oldManager,
        User newManager);

    Task ManagerForceDeletedLog(User manager);

    Task PasswordChangedLog(User user);
    Task LoginLog(User user);
    Task LogoutLog(User user);
}